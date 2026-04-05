import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../../utils/manip-node/modules/merge-top-lvl-props-by-depth-of-nesting.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";

import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";

// instantiate classes
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const meta_strategy = MetaStrategy.getInstance();
const meta_parser = MetaParser.getInstance();
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
// get keys
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const TARGET_REL_PATH =
  "Mirror/inferred-tagged/hw-engg-au/merged-by-id/full-profile-enriched/curation-enriched";
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const DEST_DIR_REL_PATH = "sub-set";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
const CURATION_KEY = "curation";
lookup_props.setStateTo("COMPANY");
const cpy_map = new Map();

/* from taxo, collect the names of:
- parent category e.g. "Electronics Engineering",
- along with the ones of all of its sub-categories */
const sub_tree_names = [
  "electronics_engineering",
  "robotics_engineering",
  "electro_optical_sensor",
  "mechatronics",
];
// ["systems_engineering"]; ["optical_engineering", "electro_optical_sensor"]; // ["mechanical_engineering", "mechatronics"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"];
const sub_cat_names = deDupArr(
  sub_tree_names.flatMap((sub_tree_name) => {
    taxo_parser.setSubTreeStateBy(sub_tree_name);
    return taxo_parser
      .getTreeNodes(taxo_parser.sub_tree)
      .map((crit) => crit.name);
  }),
);

// // trace the absolute path from root node to a target node
// const SEGMENT_KEY = "name";
// const n_e_coll_parser = new NodesEdgesCollectionParser();
// const curr_n_e_coll = taxo_parser.toNodeEdgeColBFTinAOFnoIDcascadingBy();
// n_e_coll_parser.setStateTo(curr_n_e_coll);
// const full_path = n_e_coll_parser.getPathToNodeBy(
//   n_e_coll_parser.nodes.find((n) => n[SEGMENT_KEY] === sub_cat_names[1]),
//   SEGMENT_KEY,
//   "id",
// ); // tree_parser.node_name_key

console.log(`Current PID: ${process.pid}`);

/**
 * Step16 - pull the company records that are tagged against, at least, on target curation tag
 * */
meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        // check if current company has employees in the target taxo field
        const is_in_target = sub_cat_names.some((name) =>
          isTaggedWith(cpy, [...meta_strategy.meta_path, CURATION_KEY, name]),
        );

        if (!is_in_target) return;

        // aggregate all current company records
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) return;
        const existing_identifier_reference = Array.from(cpy_map.keys()).find(
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
          cpy_map.set(curr_identifier, cpy);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          const cpy_rec = cpy_map.get(existing_identifier_reference);

          if (!cpy_rec) {
            cpy_map.set(curr_identifier, cpy);
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

          cpy_map.set(
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

async function printLonglistOfCompanies() {
  try {
    // write to file
    const base_name = `${DEST_DIR_REL_PATH}-${sub_tree_names[0]}-${cpy_map.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(cpy_map.values()),
    );
  } catch (error) {
    console.error(`Error processing longlist`, error);
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    await printLonglistOfCompanies();
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
