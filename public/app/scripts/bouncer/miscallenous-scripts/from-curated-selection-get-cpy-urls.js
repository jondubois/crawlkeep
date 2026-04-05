import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { copyToClipboard } from "../../lib/copy-to-clipboard.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";

// get keys
const lookup_props = LookupProps.getInstance();
const CPY_ID_KEYS = lookup_props.company_id_keys.concat("cpy_id");

const SRC_REL_PATH = "F:/My Drive/insnare/candidate/Ran Marom/temp";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const SRC_ABS_PATH = getAbsPath(SRC_REL_PATH);

// filename
const FILE_EXT = ".json";

// set params
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
const CPY_URL_REL_PATH = "https://www.linkedin.com/company/";
const cpy_url_set = new Set();
const CURATED_LABELS_KEY = "curated_labels";
const SELECTION_LABEL = "Job Search";

console.log(`Current PID: ${process.pid}`);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((curated_selection) => {
        const curr_identifier = extractFromObjBy(
          curated_selection,
          CPY_ID_KEYS,
        );
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

        if (!curated_selection[CURATED_LABELS_KEY].includes(SELECTION_LABEL))
          return;

        // try out all possible ID to get the company URL
        const cpy_id =
          curated_selection?.[CPY_ID_KEYS.find((k) => curated_selection[k])];

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
    await processWriteOneFileAtATime();
    console.log("Companies without ID: ", cpies_w_no_id_count);
    console.log("URLs found: ", cpy_url_set.size);
    copyToClipboard(Array.from(cpy_url_set).join("\n"));
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
