import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { copyToClipboard } from "../../lib/copy-to-clipboard.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";

// get keys
const lookup_props = LookupProps.getInstance();
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json"; // ".txt";
// const getAbsPath = (rel_path) =>
//   path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
// const TARGET_REL_PATH =
//   "Mirror/inferred-tagged/expert-in/electronics-engineering/propagated/to-be-curated";
// const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
// const TARGET_ABS_PATH =
//   "F:/My Drive/insnare/data-set/company-full-profile/TASK-281/deduped-merged-by-id/normalized/curation-tagged/temp";
const TARGET_ABS_PATH =
  "F:/My Drive/insnare/data-set/company-full-profile/TASK-281/deduped-merged-by-id/normalized/sub-set/temp";
const DEST_DIR_REL_PATH = "linkedin-urls";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set params
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
const CPY_URL_REL_PATH = "https://www.linkedin.com/company/";
const cpy_url_set = new Set();

console.log(`Current PID: ${process.pid}`);

/* Step10 - Extract URLs of companies to get the full company profile */
async function fromCpyGetUrl() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

        // try out all possible ID to get the company URL
        const cpy_id = cpy?.[lookup_props.company_id_keys.find((k) => cpy[k])];
        if (cpy_id) cpy_url_set.add(CPY_URL_REL_PATH.concat(cpy_id));
      });

      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file: ${dirent.name}`, error);
    }
  }
}

async function fromCpyIdGetUrl() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy_id) => {
        if (cpy_id) cpy_url_set.add(CPY_URL_REL_PATH.concat(cpy_id));
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
    // await fromCpyGetUrl();
    await fromCpyIdGetUrl();
    console.log("Companies without ID: ", cpies_w_no_id_count);
    console.log("URLs found: ", cpy_url_set.size);
    copyToClipboard(Array.from(cpy_url_set).join("\n"));
    // const base_name = `${DEST_DIR_REL_PATH}-${cpy_url_set.size}-cpies`;
    // tryWriteFileSync(
    //   DEST_DIR_ABS_PATH,
    //   base_name,
    //   FILE_EXT,
    //   Array.from(cpy_url_set.values()),
    // );
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
