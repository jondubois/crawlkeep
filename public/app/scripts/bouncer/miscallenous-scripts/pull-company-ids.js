import path from "path";
import { v4 as uuidv4 } from "uuid";

import { isEmptyObj } from "../../utils/check/index.js";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { tryRegExp } from "../../utils/manip-str/modules/try-regexp.js";

import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { toValidFileNameFrom } from "../../utils/manip-str/modules/to-valid-file-name-from.js";

const lookup_props = LookupProps.getInstance();

const SRC_RELATIVE_PATH =
  "Documents/Mirror/nested-normalized-profiles/inherent-tagged-profiles/inferred-tagged-profiles/longlist-cpies/deduped-cpies/filtered-cpies/curated-cpies/set-of-ids";

const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_RELATIVE_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory. */
const ID_SET_REL_PATH = "set-of-ids";
const ID_SET_ABS_PATH = path.resolve(SRC_ABS_PATH, ID_SET_REL_PATH);
createDir(ID_SET_ABS_PATH);

const FILE_EXT = ".json"; // ".xlsx"; //
const CPY_ID_KEYS = lookup_props.company_id_keys;

const id_set = new Set();
let merged_recs_count = 0;
let cpies_w_no_id_count = 0;

// load IDs selected manually
Array.from(new Set([])).forEach((n) => id_set.add({ id: n.toString() }));

const to_be_deleted_cpy_ucns = Array.from(new Set([]));
const discipline_name = "hw-engg";

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      // const filtered_cpies = json_arr.filter(
      //   (cpy) => !to_be_deleted_cpy_ucns.includes(cpy.id),
      // );

      //deduplicate IDs
      json_arr.forEach((curr_cpy) => {
        const curr_identifier = extractFromObjBy(curr_cpy, CPY_ID_KEYS);

        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

        const existing_identifier_reference = Array.from(id_set.keys()).find(
          (id_obj) =>
            CPY_ID_KEYS.filter((k) => k in curr_identifier)
              .filter((k) => k in id_obj)
              .some((k) => id_obj?.[k] === curr_identifier?.[k]),
        );

        if (!existing_identifier_reference) {
          id_set.add(curr_identifier);
        } else {
          merged_recs_count++;
          Object.assign(existing_identifier_reference, curr_identifier);
        }
      });
      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file ${dirent.name}:`, error);
    }
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    console.log(`Total number of duplicate records: ${merged_recs_count}`);
    console.log(`Total number of records without IDs: ${cpies_w_no_id_count}`);
    // const depuded_cpies = Array.from(id_set.keys());
    const depuded_cpies = Array.from(id_set).map(
      (id_obj) => `https://www.linkedin.com/company/${Number(id_obj.id)}`,
    );

    // write to file
    const base_name = `curated-${discipline_name}-cpies-${
      id_set.size
    }-${ID_SET_REL_PATH}-${uuidv4()}`;
    await tryWriteFile(ID_SET_ABS_PATH, base_name, FILE_EXT, depuded_cpies); // TEST_PROFILE_ABS_PATH // ID_SET_ABS_PATH
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
