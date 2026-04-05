import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { toSerialised } from "../../utils/manip-obj/modules/to-nested.js";
import { tryWriteFile } from "../../utils/file-system/modules/try-write-file.js";

// instantiate classes
import { NestingBaseStrategy } from "../../data-manip/feature4-to-nested-normalized/classes/nesting-base-strategy.js";
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
const nesting_strategy = new NestingBaseStrategy();
const lookup_props = LookupProps.getInstance();

// get keys
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json"; // ".xlsx";
// const SRC_REL_PATH =
//   "Documents/exeksourcing-data/scraped_content/DB/DB_engineering_AU/DB_sftwEngineering/data-dump-26042024/nested-normalized-profiles"; // "Documents/Mirror/";
// const SRC_ABS_PATH = path.resolve(
//   process.env.HOME || process.env.USERPROFILE,
//   SRC_REL_PATH,
// );
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/company-full-profile/TASK-281/deduped-merged-by-id/";
const DEST_DIR_REL_PATH = "normalized";
const DEST_DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
// set variables
nesting_strategy.setStateTo("COMPANY");
const normalized_cpies_set = new Set();

console.log(`Current PID: ${process.pid}`);

/* Step11 - Merge `Company`'s tagged lite with "full profile", using dedup-merge-rec-by.js */
/* Step12 - Remove the category prefix off properties */
async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }
        normalized_cpies_set.add(
          toSerialised(cpy, nesting_strategy.raw_patterns),
        );
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
    console.log("Companies without an ID: ", cpies_w_no_id_count);
    const base_name = `${DEST_DIR_REL_PATH}-${normalized_cpies_set.size}-cpies`;
    tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(normalized_cpies_set.values()),
    );
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
