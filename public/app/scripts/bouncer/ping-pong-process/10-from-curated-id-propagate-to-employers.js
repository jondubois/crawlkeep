import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { isEmptyObj, isTaggedWith } from "../../utils/check/index.js";
import { fetchJSONfromLocalDir } from "../../utils/file-system/modules/fetch-from-local-dir.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../../utils/manip-node/index.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";
import { ProfileParser } from "../../LI_profile_parsing/classes/parser/profile-parser.js";
import { PropStrategy } from "../../LI_profile_parsing/classes/strategy/prop-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";

// get keys
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const lookup_props = LookupProps.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const profile_parser = ProfileParser.getInstance();
const prop_strategy = PropStrategy.getInstance();
const meta_parser = MetaParser.getInstance();
const entity_parser = EntityParser.getInstance();
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const EXPERTISE_KEY = prop_strategy.expertise_key;

// filename
const FILE_EXT = ".json";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
// const TARGET_REL_PATH =
//   "Mirror/inferred-tagged/aggregated-broad/curated/merged-by-id";
// const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/curated-cpies/recordcurator/electronics-engineering";
const TARGET_REL_PATH = "Mirror/inferred-tagged"; // "Mirror/inferred-tagged/expert-in/electronics-engineering"; //
const TARGET_ABS_PATH = getAbsPath(TARGET_REL_PATH);
const DEST_DIR_REL_PATH = "propagated";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// set variables
const SELECTION_ID_KEY = "cpy_id";
const CURATED_LABELS_KEY = "curated_labels";
lookup_props.setStateTo("COMPANY");
const CPY_ID_KEYS = lookup_props.company_id_keys;
meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
const substract_cpies_map = new Map();
const cpy_id_set = new Set();
let cpy_w_no_id_set = new Set();
const sel_missing_id_set = new Set();

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

/**
 * From curation, we have a list of companies that we know are in [INSERT TAXO CATEGORY].
 * Look up the experts in [INSERT TAXO CATEGORY] to see if they have worked with any of these companies.
 * if so, aggregate all their employers.
 */
async function processWriteOneFileAtATime() {
  // load the IDs of companies that were curated as characterised in [INSERT TAXO CATEGORY] in `cpy_id_set`
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

    // // check if curation tag comprises any of the sub-categories
    // const is_in_scope = sub_cat_names.some((name) =>
    //   isTaggedWith(cpy, [
    //     ...meta_strategy.meta_path,
    //     ...[CURATION_KEY, tag_strategy.metric_keys[0], name],
    //   ]),
    // );
    // if (is_in_scope) cpy_id_set.add(curr_identifier);

    cpy_id_set.add(sel[SELECTION_ID_KEY]);
  });
  const curated_cpy_ids = Array.from(cpy_id_set);

  const reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      json_arr.forEach((person) => {
        // check if the `Person` is `expert_in` any of the sub-categories
        const is_expertise_in_scope = sub_cat_names.some((name) => {
          return isTaggedWith(person, [
            ...meta_strategy.meta_path,
            ...[EXPERTISE_KEY, name],
          ]);
        }); // tag_strategy.metric_keys[0],

        if (!is_expertise_in_scope) return;

        /* Propagate to all employers of the expert in [INSERT EXPERTISE] */
        profile_parser.setStateTo(person);
        const has_worked_at_curated_cpy = profile_parser.companies.some(
          (cpy) => {
            return curated_cpy_ids.some((id) =>
              lookup_props.company_id_keys.some(
                (k) => k in cpy && cpy[k] !== undefined && id === cpy[k],
              ),
            );
          },
        );

        // const has_worked_at_curated_cpy1 = all_employers.some((cpy) => {
        //   return lookup_props.company_id_keys.some((k) => {
        //     return cpy_id_set.has(cpy[k]);
        //   });
        // });

        if (!has_worked_at_curated_cpy) return;

        profile_parser.companies.forEach((cpy) => {
          const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
          if (isEmptyObj(curr_identifier)) {
            cpy_w_no_id_set.add(cpy);
            return;
          }
          const existing_identifier_reference = Array.from(
            substract_cpies_map.keys(),
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
            substract_cpies_map.set(curr_identifier, cpy);
          } else {
            Object.assign(existing_identifier_reference, curr_identifier);
            const cpy_rec = substract_cpies_map.get(
              existing_identifier_reference,
            );

            if (!cpy_rec) {
              substract_cpies_map.set(curr_identifier, cpy);
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

            substract_cpies_map.set(
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

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    console.log(
      "Number of curated selection missing an ID: ",
      sel_missing_id_set.size,
    );
    const found_base_name = `${DEST_DIR_REL_PATH}-to-${substract_cpies_map.size}-${sub_tree_names[0]}-lite-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      found_base_name,
      FILE_EXT,
      Array.from(substract_cpies_map.values()),
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
