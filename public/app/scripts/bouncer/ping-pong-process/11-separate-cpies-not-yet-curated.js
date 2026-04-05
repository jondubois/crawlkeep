import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { fetchJSONfromLocalDir } from "../../utils/file-system/modules/fetch-from-local-dir.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";

// get keys
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const lookup_props = LookupProps.getInstance();
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/curated-cpies/recordcurator/electronics-engineering/deduped-merged-by-id";
const TARGET_REL_PATH =
  "Mirror/inferred-tagged/expert-in/electronics-engineering/propagated";
//  "Mirror/inferred-tagged/electronics-aggregated-au/temp";
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const DEST_DIR_REL_PATH = "to-be-curated";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
const SELECTION_ID_KEY = "cpy_id";
const CURATED_LABELS_KEY = "curated_labels";
lookup_props.setStateTo("COMPANY");
let cpies_w_no_id_count = 0;
const to_review_set = new Set();
const sel_missing_id_set = new Set();
const cpy_id_set = new Set();

/* from taxo, collect the names of:
- parent category e.g. "Electronics Engineering",
- along with the ones of all of its sub-categories */
const sub_tree_names = [
  "electronics_engineering",
  "robotics_engineering",
  "electro_optical_sensor",
  "mechatronics",
];
// ["systems_engineering"]; ["optical_engineering", "electro_optical_sensor"]; // ["mechanical_engineering", "mechatronics"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"]; //

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
  // load the IDs of companies that were curated as characterised in [INSERT TAXO CATEGORY] in `cpy_id_set`
  // /!\ "id" is the only key checked, because curated selection only captures "id". It should check against `lookup_props.company_id_keys`
  const curated_selections = await fetchJSONfromLocalDir(
    SRC_ABS_PATH,
    FILE_EXT,
  );
  curated_selections.forEach((sel) => {
    if (!sel?.[SELECTION_ID_KEY]) {
      sel_missing_id_set.add(sel);
      return;
    }

    // check if curated selection is in target taxo categories
    const is_in_target = sub_cat_names.some((name) =>
      sel?.[CURATED_LABELS_KEY]?.includes(name),
    );

    if (!is_in_target) return;

    cpy_id_set.add(sel[SELECTION_ID_KEY]);
  });

  const source_reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of source_reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

        if (cpy_id_set.has(cpy?.id)) return;

        to_review_set.add(cpy);
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
    const base_name = `${DEST_DIR_REL_PATH}-${to_review_set.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(to_review_set),
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
