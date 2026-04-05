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

const TARGET_REL_PATH = "Mirror/inferred-tagged/aggregated-broad";
const TARGET_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  TARGET_REL_PATH,
);
const SRC_REL_PATH =
  "Mirror/longlist-cpies/deduped-cpies/temp/electronics-engineering";
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_REL_PATH,
);

const DEST_DIR_REL_PATH = "cpy-substract";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// filename
const FILE_EXT = ".json";

// set params
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
const all_cpies_map = new Map();
const substract_set = new Set();
const missing_cpies_set = new Set();

console.log(`Current PID: ${process.pid}`);

async function processWriteOneFileAtATime() {
  // load target into `all_cpies_map`
  const target = await fetchJSONfromLocalDir(TARGET_ABS_PATH, FILE_EXT);
  target.forEach((cpy) => {
    const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);

    // abort if `curr_identifier` is empty
    if (isEmptyObj(curr_identifier)) {
      cpies_w_no_id_count++;
      return;
    }

    all_cpies_map.set(curr_identifier, cpy);
  });

  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT); // SRC_TEST_ABS_PATH // SRC_ABS_PATH
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((curr_cpy) => {
        /* Separate the companies already reviewed from the rest */

        // isolate ID properties into a new object that serves as a key for the Set()
        const curr_identifier = extractFromObjBy(curr_cpy, CPY_ID_KEYS);

        /* in JavaScript, there isn't a direct way to get the memory address or reference of an object as in lower-level languages like C or C++.
        Check if a key exists in the Map() that shares at least one property with `curr_identifier`
        Map.has() can't perform a partial match on the properties of the key objects.
        It's based on SameValueZero algorithm, which is similar to strict equality (===).
        */
        const existing_identifier_reference = Array.from(
          all_cpies_map.keys(),
        ).find((id_obj) =>
          CPY_ID_KEYS.some(
            (k) =>
              k in curr_identifier &&
              k in id_obj &&
              curr_identifier[k] !== undefined &&
              id_obj[k] === curr_identifier[k],
          ),
        ); /* Map uses the reference in memory to the ID container aka "identifier" as the key.
            The exact same object reference is required to access the associated value.*/

        // check for a tagged record. If not, it'll have to be downloaded
        if (existing_identifier_reference) {
          substract_set.add(all_cpies_map.get(existing_identifier_reference));
        } else {
          missing_cpies_set.add(curr_cpy);
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
    console.log("Number of missing companies: ", missing_cpies_set.size);
    console.log("Number of companies found: ", substract_set.size);
    const found_base_name = `${DEST_DIR_REL_PATH}-found-${substract_set.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      found_base_name,
      FILE_EXT,
      Array.from(substract_set),
    );
    const missing_base_name = `${DEST_DIR_REL_PATH}-missing-${missing_cpies_set.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      missing_base_name,
      FILE_EXT,
      Array.from(missing_cpies_set),
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
