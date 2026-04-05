import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";
import { tryWriteFile } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import {
  toRegexPatternEscape,
  tryRegExp,
} from "../../utils/manip-str/index.js";

// initiate classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { PropStrategy } from "../../LI_profile_parsing/classes/strategy/prop-strategy.js";

const lookup_props = LookupProps.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const prop_strategy = PropStrategy.getInstance();

// get keys / set state
lookup_props.setStateTo("PERSON");
const PERSON_ID_KEYS = lookup_props.person_id_keys;
const EXPERTISE_KEY = prop_strategy.expertise_key;
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
const PERSON_BASE_URL = "https://www.linkedin.com/in/";
const person_id_pattern =
  toRegexPatternEscape(PERSON_BASE_URL).concat("(.*?)(?:s|$)");

// filename
let i = 0;
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const TARGET_REL_PATH = "Mirror/inferred-tagged";
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const DEST_DIR_REL_PATH = "expert-in";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
const experts_map = new Map();
const person_w_no_id_set = new Set();

// taxonomy
const sub_tree_names = ["systems_engineering"];
/* [
  "mechanical_engineering",
  "mechatronics",
  "robotics_engineering",
]; */
/* [
  "electronics_engineering",
  "robotics_engineering",
  "electro_optical_sensor",
  "mechatronics",
]; */
// ["systems_engineering"]; ["optical_engineering", "electro_optical_sensor"]; // ["talent_acquisition_id2"]; //

/* from taxo, collect the names of:
- parent category e.g. "Electronics Engineering",
- along with the ones of all of its sub-categories */
// taxo_parser.toNodeEdgeColBFTinAOFwID(); // sets nodes & edges collections, in preparation for the next step
const sub_cat_names = deDupArr(
  sub_tree_names.flatMap((sub_tree_name) => {
    taxo_parser.setSubTreeStateBy(sub_tree_name);
    return taxo_parser
      .getTreeNodes(taxo_parser.sub_tree)
      .map((crit) => crit.name);
  }),
);

console.log(`Current PID: ${process.pid}`);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((person) => {
        const curr_identifier = PERSON_ID_KEYS.reduce((acc, k) => {
          if (k === "lir_niid" && person?.[k]) {
            const corrected_id = /\)$/.test(person[k])
              ? `A${person[k].replace(/\)/, "")}`
              : person[
                  k
                ]; /* couldn't use object literal property value shorthand because,
                  JavaScript would interpret `{ person[k] }` as trying to create an object with a key of `person[k]` and
                  a value of an undeclared variable named `person[k]` */
            return { ...acc, ...(corrected_id && { [k]: corrected_id }) };
          }

          if (k === "public_id" && !person?.[k] && person?.["linkedin_url"]) {
            const match = tryRegExp(person_id_pattern, "i").exec(
              person.linkedin_url,
            );
            const pub_id = match?.groups?.shift();
            // conditionally add the property `public_id` to `curr_identifier`
            return { ...acc, ...(pub_id && { [k]: pub_id }) };
          }

          return { ...acc, ...(person?.[k] && { [k]: person[k] }) };
        }, {});

        if (isEmptyObj(curr_identifier)) {
          person_w_no_id_set.add(person);
          return;
        }

        /* check if the `Person` is `expert_in` any of the sub-categories
        "tags": {
          "inferred": {
            "expertise_in": { */
        const is_expertise_in_scope = sub_cat_names.some((name) => {
          return isTaggedWith(person, [
            ...meta_strategy.meta_path,
            ...[EXPERTISE_KEY, name],
          ]);
        });

        if (!is_expertise_in_scope) return;

        const existing_identifier_reference = Array.from(
          experts_map.keys(),
        ).find((id_obj) =>
          PERSON_ID_KEYS.some(
            (k) =>
              k in curr_identifier &&
              k in id_obj &&
              curr_identifier[k] !== undefined &&
              id_obj[k] === curr_identifier[k],
          ),
        );

        if (!existing_identifier_reference) {
          experts_map.set(curr_identifier, person);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          experts_map.set(existing_identifier_reference, person); // overwrites
        }
      });

      // check the size of `experts_map`
      const experts_map_size = Buffer.byteLength(
        JSON.stringify(Array.from(experts_map.values()), null, 2),
        "utf-8",
      );

      if (experts_map_size > 100 * 1024 * 1024) {
        // 100 MB. 512 MB is the max size for a single file in S3, MS Word.
        const base_name = `${DEST_DIR_REL_PATH}-${
          sub_tree_names[0]
        }-batch-${i++}-${experts_map.size}-persons`;
        await tryWriteFile(
          DEST_DIR_ABS_PATH,
          base_name,
          FILE_EXT,
          Array.from(experts_map.values()),
        );
        // free up working memory
        for (const key of experts_map.keys()) {
          experts_map.set(key, {});
        }
      }

      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file: ${dirent.name}`, error);
    }
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    console.log("Number of persons with no ID: ", person_w_no_id_set.size);
    const missing_id_base_name = `${sub_tree_names[0]}-missing-id-${person_w_no_id_set.size}-persons`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      missing_id_base_name,
      FILE_EXT,
      Array.from(person_w_no_id_set),
    );
    const base_name = `${DEST_DIR_REL_PATH}-${sub_tree_names[0]}-batch-${i++}-${
      experts_map.size
    }-persons`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(experts_map.values()),
    );
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    console.timeEnd("Script Execution Time");
  }
}

main().then(() => console.log("Done"));

// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
