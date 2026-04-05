import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { fetchJSONfromLocalDir } from "../../utils/file-system/modules/fetch-from-local-dir.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";

// get keys
const lookup_props = LookupProps.getInstance();
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const TARGET_REL_PATH =
  "Mirror/inferred-tagged/expert-in/electronics-engineering/propagated"; // "Mirror/inferred-tagged/electronics-aggregated-au/temp"; // "Mirror/inferred-tagged/temp/temp/merged-by-id";
const SRC_REL_PATH =
  "F:/My Drive/insnare/data-set/curated-cpies/recordcurator/electronics-engineering/deduped-merged-by-id";
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const SRC_ABS_PATH = getAbsPath(SRC_REL_PATH);
const DEST_DIR_REL_PATH = "to-be-curated";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set params
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
const to_review_map = new Map();

console.log(`Current PID: ${process.pid}`);

async function processWriteOneFileAtATime() {
  // load target into `to_review_map`
  const target_reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of target_reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }
        to_review_map.set(curr_identifier, cpy);
      });

      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file: ${dirent.name}`, error);
    }
  }

  const source_reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of source_reader) {
    try {
      json_arr.forEach((cpy) => {
        /* Step9 - Separate the companies already reviewed from the rest */

        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }
        const existing_identifier_reference = Array.from(
          to_review_map.keys(),
        ).find((id_obj) =>
          CPY_ID_KEYS.some(
            (k) =>
              k in curr_identifier &&
              k in id_obj &&
              curr_identifier[k] !== undefined &&
              id_obj[k] === curr_identifier[k],
          ),
        );
        if (existing_identifier_reference) {
          to_review_map.delete(existing_identifier_reference);
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
    console.log("Number of companies without ID: ", cpies_w_no_id_count);
    const base_name = `${DEST_DIR_REL_PATH}-${to_review_map.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(to_review_map.values()),
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
