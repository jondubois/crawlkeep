import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../../utils/manip-node/modules/merge-top-lvl-props-by-depth-of-nesting.js";

// instantiate classes
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const meta_parser = MetaParser.getInstance();

// get keys
const CPY_ID_KEYS = lookup_props.company_id_keys.concat("cpy_id");

// filename
const FILE_EXT = ".json"; // .xlsx
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE, rel_path);
const TARGET_REL_PATH =
  "F:/My Drive/insnare/data-set/curated-cpies/recordcurator/electronics-engineering";
// "F:/My Drive/insnare/data-set/company-full-profile/TASK-281";

const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);

const DEST_DIR_REL_PATH = "deduped-merged-by-id";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
let target_cpies_w_no_id_set = new Set();
lookup_props.setStateTo("COMPANY");
const target_map = new Map();

console.log(`Current PID: ${process.pid}`);

async function mergeCpyById() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);

        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          target_cpies_w_no_id_set.add(cpy);
          return;
        }

        const existing_identifier_reference = Array.from(
          target_map.keys(),
        ).find((id_obj) =>
          CPY_ID_KEYS.some(
            (k) =>
              k in curr_identifier &&
              k in id_obj &&
              curr_identifier[k] !== undefined &&
              id_obj[k] === curr_identifier[k],
          ),
        );

        if (!existing_identifier_reference) {
          target_map.set(curr_identifier, cpy);
        } else {
          Object.assign(
            existing_identifier_reference,
            curr_identifier,
          ); /* mutates `existing_identifier` in place ByRef. Object is the only mutable value in JavaScript,
          which means their properties can be changed without changing their reference in memory.
          Object.assign() static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
          For properties that share the same key, value in the target object is overwritten by the value in the last source.
          It returns the mutated target object */

          const cpy_rec = target_map.get(existing_identifier_reference); // `undefined` if not found

          if (!cpy_rec) {
            target_map.set(curr_identifier, cpy);
            return;
          }

          // merge meta
          entity_parser.setEntityTo(cpy);
          for (const type in entity_parser.meta) {
            meta_strategy.setStateTo(
              type,
              "inherent",
            ); /* "inherent" is only a placeholder, used to set `type` for `setMetaParserStateTo()`.
                Preferred to use the method `mergeCascading`, rather than the function of the same name */
            meta_parser.setMetaParserStateTo(cpy_rec);
            meta_parser.mergeCascading(entity_parser.meta[type]);
          }

          // merge the rest of the properties (ie. top-level) by depth of nesting
          // lookup_props.setStateTo("COMPANY"); // set up above
          entity_parser.setEntityTo(cpy_rec);
          const tlp_rec = entity_parser.top_level_props;
          entity_parser.setEntityTo(cpy);
          const tlp_curr = entity_parser.top_level_props;

          target_map.set(
            existing_identifier_reference,
            Object.assign(
              cpy_rec,
              mergeTopLevelPropsByDepthOfNesting(tlp_rec, tlp_curr),
            ),
          );
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
    await mergeCpyById();
    console.log(
      "Number of companies missing an ID: ",
      target_cpies_w_no_id_set.size,
    );
    // write to file
    const base_name = `${DEST_DIR_REL_PATH}-${target_map.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(target_map.values()),
    );
    const missing_base_name = `DNU-missing-id-${target_cpies_w_no_id_set.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      missing_base_name,
      FILE_EXT,
      Array.from(target_cpies_w_no_id_set.values()),
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
