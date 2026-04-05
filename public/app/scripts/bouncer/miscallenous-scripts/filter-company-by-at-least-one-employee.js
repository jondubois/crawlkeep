import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import {
  getValAtNodeCascading,
  mergeTopLevelPropsByDepthOfNesting,
} from "../../utils/manip-node/index.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";

import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { PropStrategy } from "../../LI_profile_parsing/classes/strategy/prop-strategy.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
// import { copyToClipboard } from "../../lib/copy-to-clipboard.js";

// instantiate classes
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const meta_strategy = MetaStrategy.getInstance();
const meta_parser = MetaParser.getInstance();
const prop_strategy = PropStrategy.getInstance(); // creates an instance of `PropStrategy`, which internally has its own instance of `MetaStrategy`
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
// get keys
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const SKILLSET_KEY = prop_strategy.skillset_key;
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const FILE_EXT = ".json"; // .xlsx
const SRC_REL_PATH =
  "Mirror/inferred-tagged/systems-engineering-aggregated-au/temp";
const SRC_ABS_PATH = getAbsPath(SRC_REL_PATH);
const DEST_DIR_REL_PATH = "at-least-1-employee";
const DEST_DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
lookup_props.setStateTo("COMPANY");
const at_least_one_employee_cpy_map = new Map();
let cpies_w_no_id_count = 0;

/* from taxo, collect the names of:
- parent category e.g. "Electronics Engineering",
- along with the ones of all of its sub-categories */
const sub_tree_names = ["systems_engineering"];
/* [
  "electronics_engineering",
  "robotics_engineering",
  "electro_optical_sensor",
  "mechatronics",
]; */
// systems_engineering; ["optical_engineering", "electro_optical_sensor"]; // ["mechanical_engineering", "mechatronics"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"]; //
const sub_cat_names = deDupArr(
  sub_tree_names.flatMap((sub_tree_name) => {
    taxo_parser.setSubTreeStateBy(sub_tree_name);
    return taxo_parser
      .getTreeNodes(taxo_parser.sub_tree)
      .map((crit) => crit.name);
  }),
);
console.log(`Current PID: ${process.pid}`);

meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return false;
        }

        /* check if current company has employees in the target taxo field
          "added_props": {
              "inferred": {
                "skillset": { */
        const has_employees_in_target_field = sub_cat_names.some((name) =>
          isTaggedWith(cpy, [...meta_strategy.meta_path, SKILLSET_KEY, name]),
        );
        // // check if current company was inherent tagged against any of the `sub_cat_names`
        // const is_inherent_tagged = () => {
        //   meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
        //   const inherent_meta = getValAtNodeCascading(
        //     cpy,
        //     meta_strategy.meta_path,
        //   );

        //   if (!inherent_meta || isEmptyObj(inherent_meta)) return false;

        //   tree_parser.setStateTo(inherent_meta);
        //   return tree_parser
        //     .getLeafNodeIsObjCascading()
        //     .some((node) =>
        //       sub_cat_names.some((name) => name === node[bool_parser.kw_key]),
        //     );
        // };
        if (!has_employees_in_target_field) return; //  && !is_inherent_tagged();  to restrict the casting of the net: ||

        // aggregate the company records
        const existing_identifier_reference = Array.from(
          at_least_one_employee_cpy_map.keys(),
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
          at_least_one_employee_cpy_map.set(curr_identifier, cpy);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          const cpy_rec = at_least_one_employee_cpy_map.get(
            existing_identifier_reference,
          );

          if (!cpy_rec) {
            at_least_one_employee_cpy_map.set(curr_identifier, cpy);
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

          at_least_one_employee_cpy_map.set(
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
    console.log("Number of companies with no ID", cpies_w_no_id_count);
    const base_name = `${DEST_DIR_REL_PATH}-${at_least_one_employee_cpy_map.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      base_name,
      FILE_EXT,
      Array.from(at_least_one_employee_cpy_map.values()),
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
