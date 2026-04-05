import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { tryWriteFileSync } from "../../utils/file-system/modules/try-write-file.js";
import { createDir } from "../../utils/file-system/modules/create-dir.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../../utils/manip-node/index.js";

// classes
import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";

// instantiate classes
const entity_parser = EntityParser.getInstance();
const meta_parser = MetaParser.getInstance();
const lookup_props = LookupProps.getInstance();
const meta_strategy = MetaStrategy.getInstance();

// get keys
const CPY_ID_KEYS = lookup_props.company_id_keys;

const TARGET_REL_PATH =
  "Mirror/inferred-tagged/expert-in/electronics-engineering/propagated/to-be-curated";
const TARGET_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  TARGET_REL_PATH,
);
const SRC_ABS_PATH =
  "F:/My Drive/insnare/data-set/company-full-profile/TASK-281/deduped-merged-by-id/normalized";

const DEST_DIR_REL_PATH = "full-profile-enriched";
const DEST_DIR_ABS_PATH = path.resolve(TARGET_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

// filename
const FILE_EXT = ".json";

// set params
lookup_props.setStateTo("COMPANY");
const to_enrich_map = new Map();
const full_profile_map = new Map();
const enriched_map = new Map();
const to_scrape_set = new Set();
let cpies_w_no_id_count = 0;

console.log(`Current PID: ${process.pid}`);

/**
 * @description Step13 - from `Company` lite tagged records, enrich with full profiles.
 * @todo - /!\ #NUMERIC_COMPANY_KEYS contains 4 duplicate properties.
 * Merge `follower_count`, `employee_count_low` and `employee_count_high` of the lite version
 * with `staff_count_low`, `staff_count_high`, `num_followers` of "full profile".
 */
async function processWriteOneFileAtATime() {
  // load the companies to enrich into `to_enrich_map`, by merging eventual duplicates by ID
  const target_reader = readOneFileAtATime(TARGET_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of target_reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }
        const existing_identifier_reference = Array.from(
          to_enrich_map.keys(),
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
          to_enrich_map.set(curr_identifier, cpy);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          const cpy_rec = to_enrich_map.get(existing_identifier_reference); //  ?? {} `undefined` if not found

          if (!cpy_rec) {
            to_enrich_map.set(curr_identifier, cpy);
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

          to_enrich_map.set(
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

  // load full profiles into `full_profile_map`, by merging eventual duplicates by ID
  const source_reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of source_reader) {
    try {
      json_arr.forEach((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }
        const existing_identifier_reference = Array.from(
          full_profile_map.keys(),
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
          full_profile_map.set(curr_identifier, cpy);
        } else {
          Object.assign(existing_identifier_reference, curr_identifier);
          const cpy_rec = full_profile_map.get(existing_identifier_reference); //  ?? {} `undefined` if not found

          if (!cpy_rec) {
            full_profile_map.set(curr_identifier, cpy);
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

          full_profile_map.set(
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

  // merge source into target
  to_enrich_map.forEach((tagged_lite_cpy, curr_identifier) => {
    const existing_identifier_reference = Array.from(
      full_profile_map.keys(),
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
      // no "full profile" found
      to_scrape_set.add(tagged_lite_cpy);
    } else {
      // enrich
      Object.assign(existing_identifier_reference, curr_identifier);
      const full_profile_cpy = full_profile_map.get(
        existing_identifier_reference,
      ); // `undefined` if not found

      if (!full_profile_cpy) {
        to_scrape_set.add(tagged_lite_cpy); // might create duplicates, but hey.. ¯\_(ツ)_/¯
        return;
      }

      // merge the rest of the properties (ie. top-level) by depth of nesting
      // lookup_props.setStateTo("COMPANY"); // set up above
      entity_parser.setEntityTo(full_profile_cpy);
      const tlp_rec = entity_parser.top_level_props;
      entity_parser.setEntityTo(tagged_lite_cpy);
      const tlp_curr = entity_parser.top_level_props;

      enriched_map.set(
        existing_identifier_reference,
        Object.assign(
          tagged_lite_cpy,
          mergeTopLevelPropsByDepthOfNesting(tlp_rec, tlp_curr),
        ),
      );
    }
  });
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    console.log("Number of companies missing an ID: ", cpies_w_no_id_count);
    const enriched_base_name = `${DEST_DIR_REL_PATH}-${enriched_map.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      enriched_base_name,
      FILE_EXT,
      Array.from(enriched_map.values()),
    );
    const to_scrape_base_name = `to-be-scraped-${to_scrape_set.size}-cpies`;
    tryWriteFileSync(
      DEST_DIR_ABS_PATH,
      to_scrape_base_name,
      FILE_EXT,
      Array.from(to_scrape_set),
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
