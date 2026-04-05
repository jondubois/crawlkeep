import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { fetchJSONfromLocalDir } from "../../utils/file-system/modules/fetch-from-local-dir.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";

// instantiate classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";
const lookup_props = LookupProps.getInstance();
const meta_parser = MetaParser.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
// get keys
const CPY_ID_KEYS = lookup_props.company_id_keys;
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);

// filename
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE, rel_path);
const TARGET_REL_PATH =
  "Mirror/inferred-tagged/hw-engg-au/merged-by-id/full-profile-enriched";
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/curated-cpies/recordcurator/electronics-engineering";
const DEST_DIR_REL_PATH = "curation-enriched";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set params
const CURATED_LABELS_KEY = "curated_labels";
const CURATION_KEY = "curation";
const CPY_ID_KEY = "cpy_id";
lookup_props.setStateTo("COMPANY");
meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
let cpies_w_no_id_count = 0;
const all_cpies_map = new Map();
const missing_cpies_set = new Set();
const sel_missing_id_set = new Set();
const all_taxo_cats = taxo_parser.nodes.map((crit) => crit.name);

console.log(`Current PID: ${process.pid}`);

/**
 * Step15 - add curation tag
 * from `TARGET_ABS_PATH`, load tagged lite + full company profiles into `all_cpies_map`
 * from curated selections in `SRC_ABS_PATH`, add curation tag
 */
async function loadTaggedLiteFullCpies() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

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
        );

        if (!existing_identifier_reference) {
          all_cpies_map.set(curr_identifier, cpy);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          all_cpies_map.set(existing_identifier_reference, cpy); // overwrites
        }
      });

      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file: ${dirent.name}`, error);
    }
  }
}

// // check if curation tag comprises any of the sub-categories
// const is_in_scope = sub_cat_names.some((name) =>
//   isTaggedWith(cpy, [
//     ...meta_strategy.meta_path,
//     ...[CURATION_KEY, tag_strategy.metric_keys[0], name],
//   ]),
// );

// if (is_in_scope) cpy_id_set.add(cpy);

async function addCurationTag() {
  const curated_selections = await fetchJSONfromLocalDir(
    SRC_ABS_PATH,
    FILE_EXT,
  );
  curated_selections.forEach((sel) => {
    if (!sel?.[CPY_ID_KEY]) {
      sel_missing_id_set.add(sel);
      return;
    }

    const curr_identifier = { id: sel[CPY_ID_KEY] }; // hard-coded

    const existing_identifier_reference = Array.from(all_cpies_map.keys()).find(
      (id_obj) =>
        CPY_ID_KEYS.some(
          (k) =>
            k in curr_identifier &&
            k in id_obj &&
            curr_identifier[k] !== undefined &&
            id_obj[k] === curr_identifier[k],
        ),
    );

    if (!existing_identifier_reference) {
      missing_cpies_set.add(curr_identifier);
    } else {
      Object.assign(existing_identifier_reference, curr_identifier);
      // conditionally add inferred tag `curated` to `Company` record
      meta_parser.setMetaParserStateTo(
        all_cpies_map.get(existing_identifier_reference),
      );
      sel[CURATED_LABELS_KEY].filter(Boolean)
        // only tag against Taxo categories
        .filter((label) => all_taxo_cats.includes(label))
        .forEach((tag) => {
          meta_parser.addMeta([CURATION_KEY], {
            ...(tag && { [tag]: {} }),
          });
        }); // mutates in-place
    }
  });
}

async function main() {
  console.time("Script Execution Time");
  try {
    await loadTaggedLiteFullCpies();
    await addCurationTag();
    console.log(
      "Number of curated selection missing an ID: ",
      sel_missing_id_set.size,
    );
    console.log("Number of companies missing an ID: ", cpies_w_no_id_count);
    const base_name = `${DEST_DIR_REL_PATH}-${all_cpies_map.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(all_cpies_map.values()),
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
