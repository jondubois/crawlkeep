import path from "path";
import { v4 as uuidv4 } from "uuid";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
// import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";
import { tryRegExp, toValidFileNameFrom } from "../../utils/manip-str/index.js";
// import { extractFromObjBy } from "../../utils/manip-obj/modules/extract-from-obj-by.js";
import { toRegExpPattern } from "../../data-manip/feature3-is-match-boolean-search-string/modules/to-regexp-pattern.js";
import { copyToClipboard } from "../../lib/copy-to-clipboard.js";

import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { EntityParser } from "../../LI_profile_parsing/classes/parser/entity-parser.js";
import { MetaParser } from "../../LI_profile_parsing/classes/parser/meta-parser.js";
import { MetaStrategy } from "../../LI_profile_parsing/classes/base/base-strategy.js";
import { TaxoParser } from "../../utils/classes/taxo-parser.js";

const lookup_props = LookupProps.getInstance();
const entity_parser = EntityParser.getInstance();
const meta_parser = MetaParser.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
const sub_tree_names = [
  "systems_engineering",
  "optical_engineering",
  "electronics_engineering",
  "robotics_engineering",
]; // ["optical_engineering", "electro_optical_sensor"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"]; //
// from taxo, collect the names of a parent category e.g. "Electronics Engineering",
// along with the ones of all of its sub-categories
// taxo_parser.toNodeEdgeColBFTinAOFwID(); // sets nodes & edges collections, in preparation for the next step
const sub_cat_names = deDupArr(
  sub_tree_names.flatMap((sub_tree_name) => {
    taxo_parser.setSubTreeStateBy(sub_tree_name);
    return taxo_parser
      .getTreeNodes(taxo_parser.sub_tree)
      .map((crit) => crit?.name)
      .filter(Boolean)
      .flat();
  }),
);
const off_limit_sub_cat_names = [
  "devops_engineering",
  "cyber_security_id1",
  // "uxui_design",
  // "venture_capital_fund",
  // "is_recruitment_agency",
  // "is_execsearch_firm",
  // "is_digital_agency",
];
const SRC_REL_PATH =
  "Documents/Mirror/nested-normalized-profiles/inherent-tagged-profiles/inferred-tagged-profiles/longlist-cpies/deduped-cpies/filtered-cpies"; // /filtered-cpies
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_REL_PATH,
);
const FILTERED_CPY_REL_PATH = "curated-cpies"; // "to-be-reviewed-cpies"; //
const FILTERED_CPY_ABS_PATH = path.resolve(SRC_ABS_PATH, FILTERED_CPY_REL_PATH);
createDir(FILTERED_CPY_ABS_PATH);
const FILE_EXT = ".json";
const DISCIPLINE_NAME = "systems-engg";

const to_be_deleted_cpy_ucns = Array.from(new Set([]));

const FLAG = "im";
const xlsx_patterns = [];
const regexes = xlsx_patterns
  .map((p) => toRegExpPattern(p))
  .map((pattern) => tryRegExp(pattern, FLAG));
const MATCHING_TEXT_COUNT_THRESHOLD = 2;
const EMPLOYEE_COUNT_THRESHOLD = 2;

const true_positives = new Set();
const false_positives = new Set();
const TARGET_KEYS = ["matching_texts"];
lookup_props.setStateTo("COMPANY");
const CPY_ID_KEYS = lookup_props.company_id_keys;
let cpies_w_no_id_count = 0;

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      // const filtered_cpies = json_arr.filter((cpy) =>
      //   regexes.some((rx) => rx.test(cpy.company_name)),
      // );
      const filtered_cpies = json_arr.filter((cpy) => {
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);

        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return false;
        }

        entity_parser.setEntityTo(cpy);

        // check the cpy's inherent tags
        let is_off_limit = false;
        let meets_matching_text_threshold = false;
        let inherent_tags = [];
        let matched_strings = [];
        meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
        if (entity_parser.meta?.[meta_strategy.type]) {
          meta_parser.setMetaParserStateTo(cpy);
          inherent_tags = meta_parser.getLeafNodesCascadingDFT();

          matched_strings = deDupArr(
            inherent_tags
              .filter((tag) => sub_cat_names.includes(tag?.keyword))
              .flatMap((tag) => TARGET_KEYS.flatMap((key) => tag[key])),
          );
          is_off_limit = inherent_tags.some((tag) =>
            off_limit_sub_cat_names.includes(tag?.keyword),
          );
          meets_matching_text_threshold =
            matched_strings.length > MATCHING_TEXT_COUNT_THRESHOLD;
        }

        // check the employees
        let has_relevant_employee = false;
        let meets_employee_threshold = false;
        meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
        if (entity_parser.meta?.[meta_strategy.type]) {
          meta_parser.setMetaParserStateTo(cpy);
          const employee_ID_containers = sub_cat_names
            .map((name) =>
              meta_parser.getValAtNodeCascading([
                meta_strategy.sub_key,
                "skillset",
                name,
                "employee_ids",
              ]),
            )
            .filter(Boolean);
          has_relevant_employee = employee_ID_containers.flat().length > 0;
          meets_employee_threshold = employee_ID_containers.some(
            (container) => container.length > EMPLOYEE_COUNT_THRESHOLD,
          );
        }

        // companies that have matching strings already aligned with what's relevant
        const is_relevant = deDupArr(
          inherent_tags.flatMap((tag) =>
            TARGET_KEYS.flatMap((key) => tag?.[key]),
          ),
        ).some((kw) => regexes.some((rx) => rx.test(kw)));

        // no need to review companies..
        // 1- ..inherent tagged with `off_limit_sub_cat_names`..
        // ..and either relevant tagged with enough occurrences, or has relevant employees
        const test_0 =
          is_off_limit &&
          (meets_matching_text_threshold || has_relevant_employee);
        // ..and not relevant tagged, yet has enough relevant employees
        const test_1 =
          is_off_limit && !matched_strings.length && meets_employee_threshold;
        // 2- ..not inherent tagged with `off_limit_sub_cat_names`, yet meet any thresholds
        const test_2 =
          meets_matching_text_threshold || meets_employee_threshold;
        const test_3 = is_relevant && has_relevant_employee;

        return !(test_0 || test_1 || test_2 || test_3);

        return to_be_deleted_cpy_ucns.includes(Number(cpy.id))
          ? (matched_strings.forEach((s) => false_positives.add(s)), false)
          : (matched_strings.forEach((s) => true_positives.add(s)), true);
      });
      // copyToClipboard(
      //   JSON.stringify(Array.from(true_positives).sort(), null, 2),
      //   null,
      //   2,
      // );

      const base_name = `list-of-${DISCIPLINE_NAME}-${
        filtered_cpies.length
      }-${FILTERED_CPY_REL_PATH}-${uuidv4()}`;
      // const base_name = `longlist-of-${DISCIPLINE_NAME}-${
      //   filtered_cpies.length
      // }-${FILTERED_CPY_REL_PATH}-${uuidv4()}`;
      await tryWriteFile(
        FILTERED_CPY_ABS_PATH,
        base_name,
        FILE_EXT,
        filtered_cpies,
      );
    } catch (error) {
      console.error(`Error processing file: ${dirent.name}`, error);
    }
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
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
