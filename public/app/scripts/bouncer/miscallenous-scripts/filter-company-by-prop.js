import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { copyToClipboard } from "../../lib/copy-to-clipboard.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { normaliseStr } from "../../utils/manip-str/modules/normalise-str.js";

import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";

// instantiate classes
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();

// filename
const FILE_EXT = ".json";
// const SRC_REL_PATH =
//   "Mirror/inferred-tagged/systems-engineering-aggregated-au/temp";
// const SRC_ABS_PATH = path.resolve(
//   process.env.HOME || process.env.USERPROFILE,
//   SRC_REL_PATH,
// );
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/company-full-profile/TASK-281/deduped-merged-by-id/normalized/sub-set";
const DISCIPLINE_NAME = "electronics-engg";
const DEST_DIR_REL_PATH = "filtered-by-prop";
const DEST_DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
lookup_props.setStateTo("COMPANY");
const CPY_ID_KEYS = lookup_props.company_id_keys;
let cpies_w_no_id_count = 0;
const cpies_w_no_loc_set = new Set();
const filtered_cpies = new Map();
// location
const LOCATION_KEYS = ["state_name", "state_abbr"]; // lookup_props.company_location_keys
const TARGET_STATE_NAME = "New South Wales";
const STATE_ABREVIATION = "NSW";
const target_locs = [TARGET_STATE_NAME, STATE_ABREVIATION].map(normaliseStr);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        entity_parser.setEntityTo(cpy);
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return false;
        }

        // check all offices
        const is_located_in_target = [
          entity_parser.top_level_props,
          ...entity_parser.nested_props.locations,
        ].some((loc) => {
          return LOCATION_KEYS.some(
            (loc_key) =>
              loc[loc_key] && target_locs.includes(normaliseStr(loc[loc_key])), // `state_name` can have "NSW" as a value
          );
        });

        // // filter by state
        // const loc_keys = LOCATION_KEYS.filter((key) => cpy[key] !== undefined);

        // if (!loc_keys.length) {
        //   cpies_w_no_loc_set.add(cpy);
        //   return;
        // }

        // const is_located_in_target = LOCATION_KEYS.some(
        //   (loc_key) =>
        //     cpy[loc_key] && target_locs.includes(normaliseStr(cpy[loc_key])),
        // );
        // const filtered_cpies = json_arr.filter((cpy) =>
        //   regexes.some((rx) => rx.test(cpy.company_name)),
        // );

        if (!is_located_in_target) return;

        entity_parser.setEntityTo(cpy);
        filtered_cpies.set(curr_identifier, cpy);
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
    console.log("Number of companies missing an ID: ", cpies_w_no_id_count);
    // const loca_base_name = `missing-loca-${cpies_w_no_loc_set.size}-cpies`;
    // await tryWriteFile(
    //   DEST_DIR_ABS_PATH,
    //   loca_base_name,
    //   FILE_EXT,
    //   Array.from(cpies_w_no_loc_set.values()),
    // );
    const base_name = `${DISCIPLINE_NAME}-${DEST_DIR_REL_PATH}-${filtered_cpies.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(filtered_cpies.values()),
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
