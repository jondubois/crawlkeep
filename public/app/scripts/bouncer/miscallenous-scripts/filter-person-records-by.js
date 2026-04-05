import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";
import {
  tryWriteFile,
  tryWriteFileSync,
  createDir,
} from "../../utils/file-system/index.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { copyToClipboard } from "../../lib/copy-to-clipboard.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { PropStrategy } from "../../LI_profile_parsing/classes/strategy/prop-strategy.js";

// get keys
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
const meta_parser = MetaParser.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const prop_strategy = PropStrategy.getInstance();

// filename
const SRC_REL_PATH = "Mirror/inferred-tagged";
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_REL_PATH,
);
const FILTERED_CPY_REL_PATH = "optical-engineering";
const FILTERED_CPY_ABS_PATH = path.resolve(SRC_ABS_PATH, FILTERED_CPY_REL_PATH);
createDir(FILTERED_CPY_ABS_PATH);
const FILE_EXT = ".json";

// const FLAG = "im";
// const xlsx_patterns = [];
// const regexes = xlsx_patterns
//   .map((p) => toRegExpPattern(p))
//   .map((pattern) => tryRegExp(pattern, FLAG));
const MATCHING_TEXT_COUNT_THRESHOLD = 2;
const EMPLOYEE_COUNT_THRESHOLD = 2;

const uniq_person_id_set = new Set();
const person_w_no_id_set = new Set();
meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
lookup_props.setStateTo("PERSON");
const PERSON_ID_KEYS = lookup_props.person_id_keys;
const EXPERTISE_KEY = prop_strategy.expertise_key;

/* from taxo, collect the names of:
- parent category e.g. "Electronics Engineering",
- along with the ones of all of its sub-categories */
const sub_tree_names = ["optical_engineering", "electro_optical_sensor"];
/* [
  "electronics_engineering",
  "robotics_engineering",
  "electro_optical_sensor",
  "mechatronics",
]; */
// systems_engineering; ["optical_engineering", "electro_optical_sensor"]; // ["mechanical_engineering", "mechatronics"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"]; //
const off_limit_names = [
  "devops_engineering",
  "cyber_security_id1",
  // "uxui_design",
  // "venture_capital_fund",
  // "is_recruitment_agency",
  // "is_execsearch_firm",
  // "is_digital_agency",
];
const sub_cat_names = deDupArr(
  sub_tree_names.flatMap((sub_tree_name) => {
    taxo_parser.setSubTreeStateBy(sub_tree_name);
    return taxo_parser
      .getTreeNodes(taxo_parser.sub_tree)
      .map((crit) => crit.name);
  }),
);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((person) => {
        // isolate ID properties into a new object that serves as a key for the Set()
        const curr_identifier = extractFromObjBy(person, PERSON_ID_KEYS);
        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          person_w_no_id_set.add(person);
          return;
        }

        // check if current company has employees in the target taxo field
        const expertise_in_target_field = sub_cat_names.some((name) =>
          isTaggedWith(person, [
            ...meta_strategy.meta_path,
            EXPERTISE_KEY,
            name,
          ]),
        );

        if (!expertise_in_target_field) return;

        /* in JavaScript, there isn't a direct way to get the memory address or reference of an object as in lower-level languages like C or C++.
          Check if a key exists in the Map() that shares at least one property with `curr_identifier`
          Map.has() can't perform a partial match on the properties of the key objects.
          It's based on SameValueZero algorithm, which is similar to strict equality (===).
          */
        const existing_identifier_reference = Array.from(
          uniq_person_id_set.keys(),
        ).find((id_obj) =>
          PERSON_ID_KEYS.some(
            (k) =>
              k in curr_identifier &&
              k in id_obj &&
              curr_identifier[k] !== undefined &&
              id_obj[k] === curr_identifier[k],
          ),
        ); /* Map uses the reference in memory to the ID container aka "identifier" as the key.
                        The exact same object reference is required to access the associated value.*/

        if (!existing_identifier_reference) {
          uniq_person_id_set.add(curr_identifier);
        }
      });

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
    console.log(
      `Number of persons in ${FILTERED_CPY_REL_PATH}: ${uniq_person_id_set.size}`,
    );
    console.log(
      `Number of persons with no ID in ${FILTERED_CPY_REL_PATH}: ${person_w_no_id_set.size}`,
    );
    if (person_w_no_id_set.size > 0) {
      const base_name = `${FILTERED_CPY_REL_PATH}-with-no-id-${person_w_no_id_set.size}-persons`;
      tryWriteFileSync(
        FILTERED_CPY_ABS_PATH,
        base_name,
        FILE_EXT,
        Array.from(person_w_no_id_set),
      );
    }
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    console.timeEnd("Script Execution Time");
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);

// Handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
