import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import {
  getValAtNodeCascading,
  mergeTopLevelPropsByDepthOfNesting,
} from "../../utils/manip-node/index.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";
import { normaliseStr } from "../../utils/manip-str/modules/normalise-str.js";

import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { BooleanParser } from "../../utils/classes/boolean-parser.js";
import { TreeParser } from "../../utils/classes/hierarchical-tree-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { PropStrategy } from "../../LI_profile_parsing/classes/strategy/prop-strategy.js";
import { ProfileParser } from "../../LI_profile_parsing/classes/parser/profile-parser.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
// import { copyToClipboard } from "../../lib/copy-to-clipboard.js";

// instantiate classes
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const bool_parser = BooleanParser.getInstance();
const tree_parser = new TreeParser();
const meta_strategy = MetaStrategy.getInstance();
const meta_parser = MetaParser.getInstance();
const profile_parser = ProfileParser.getInstance();
const prop_strategy = PropStrategy.getInstance(); // creates an instance of `PropStrategy`, which internally has its own instance of `MetaStrategy`
const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
// get keys
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const SKILLSET_KEY = prop_strategy.skillset_key;
const CPY_ID_KEYS = lookup_props.company_id_keys;

// filename
const FILE_EXT = ".json"; // .xlsx
const SRC_REL_PATH = "Mirror/inferred-tagged";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const SRC_ABS_PATH = getAbsPath(SRC_REL_PATH);
const DEST_DIR_REL_PATH = "aggregated"; // -at-least-1-employee-au
const DEST_DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set filter
lookup_props.setStateTo("COMPANY");
const cpy_map = new Map();
const TARGET_COUNTRY_NAME = "Australia";
const COUNTRY_ABREVIATION = "AU";
const LOCATION_KEYS = ["hq_region", "hq_country"];
const cpies_w_no_loc_set = new Set();

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
const target_locs = [TARGET_COUNTRY_NAME, COUNTRY_ABREVIATION].map(
  normaliseStr,
);

console.log(`Current PID: ${process.pid}`);

/**
 *  * @todo - cf. data-miner\data-manip\feature1-deduplicate-records\dedup-cpy-records\main.js
 * */
async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT); // SRC_TEST_ABS_PATH // SRC_ABS_PATH
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((nested_profile) => {
        /* Step6 - aggregating all companies at once isn't feasible in-memory.
        Hence, had to resort to filtering them on the upstream */
        meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
        profile_parser.setStateTo(nested_profile); // references each entity of the ERD, for quick access (no more having to traverse the node tree every time)
        profile_parser.companies.forEach((cpy) => {
          if (!cpy) return;

          // filter by country
          const loc_keys = LOCATION_KEYS.filter(
            (key) => cpy[key] !== undefined,
          );

          if (!loc_keys.length) {
            cpies_w_no_loc_set.add(cpy);
            return;
          }

          const is_located_in_target = loc_keys.some(
            (loc_key) =>
              cpy[loc_key] && target_locs.includes(normaliseStr(cpy[loc_key])),
          );

          if (!is_located_in_target) return;

          // check if current company has employees in the target taxo field
          const has_employees_in_target_field = sub_cat_names.some((name) =>
            isTaggedWith(cpy, [...meta_strategy.meta_path, SKILLSET_KEY, name]),
          );
          // check if current company was inherent tagged against any of the `sub_cat_names`
          const is_inherent_tagged = () => {
            meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
            const inherent_meta = getValAtNodeCascading(
              cpy,
              meta_strategy.meta_path,
            );

            if (!inherent_meta || isEmptyObj(inherent_meta)) return false;

            tree_parser.setStateTo(inherent_meta);
            return tree_parser
              .getLeafNodeIsObjCascading()
              .some((node) =>
                sub_cat_names.some((name) => name === node[bool_parser.kw_key]),
              );
          };
          if (!has_employees_in_target_field && !is_inherent_tagged()) return; //  to restrict the casting of the net: ||

          /* Step7 - aggregate all current company records.
        for `Company` with skillset, merge the record into a `Map()` by aggregating both,
        the top-level properties and its associated meta data */
          const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);

          if (isEmptyObj(curr_identifier)) return;

          /* in JavaScript, there isn't a direct way to get the memory address or reference of an object as in lower-level languages like C or C++.
          Check if a key exists in the Map() that shares at least one property with `curr_identifier`
          Map.has() can't perform a partial match on the properties of the key objects.
          It's based on SameValueZero algorithm, which is similar to strict equality (===).
          */
          const existing_identifier_reference = Array.from(cpy_map.keys()).find(
            (id_obj) =>
              CPY_ID_KEYS.some(
                (k) =>
                  k in curr_identifier &&
                  k in id_obj &&
                  curr_identifier[k] !== undefined &&
                  id_obj[k] === curr_identifier[k],
              ),
          ); /* Map uses the reference in memory to the ID container aka "identifier" as the key.
            The exact same object reference is required to access the associated value.*/

          if (!existing_identifier_reference) {
            cpy_map.set(curr_identifier, cpy);
          } else {
            Object.assign(
              existing_identifier_reference,
              curr_identifier,
            ); /* mutates `existing_ids_container` in place ByRef. Object is the only mutable value in JavaScript,
          which means their properties can be changed without changing their reference in memory.
          `Object.assign()` static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
          For properties that share the same key, the respective value in the target object is overwritten by the value in the last source.
          It returns the mutated target object */
            const cpy_rec = cpy_map.get(existing_identifier_reference); //  ?? {} `undefined` if not found

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
    const loca_base_name = `missing-loca-${cpies_w_no_loc_set.size}-cpies`;
    await tryWriteFile(
      DEST_DIR_ABS_PATH,
      loca_base_name,
      FILE_EXT,
      Array.from(cpies_w_no_loc_set.values()),
    );
    const base_name = `${DEST_DIR_REL_PATH}-${
      sub_tree_names[0]
    }-${COUNTRY_ABREVIATION.toLowerCase()}-${cpy_map.size}-cpies`;
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
