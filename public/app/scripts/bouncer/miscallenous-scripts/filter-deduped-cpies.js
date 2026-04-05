import path from "path";
import { v4 as uuidv4 } from "uuid";

import { isEmptyObj } from "../../utils/check/modules/is-empty-obj.js";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { controlFlowForAwaitLoop } from "../../lib/read-write-file/modules/control-flow-for-await-loop.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { tryRegExp } from "../../utils/manip-str/modules/try-regexp.js";
import { toRegExpPattern } from "../../data-manip/feature3-is-match-boolean-search-string/modules/to-regexp-pattern.js";

import { LookupProps } from "../../LI_profile_parsing/classes/base/base-entity.js";
import { extractFromObjBy } from "../../utils/manip-obj/index.js";
import { toValidFileNameFrom } from "../../utils/manip-str/modules/to-valid-file-name-from.js";
import { TreeParser } from "../../utils/classes/hierarchical-tree-parser.js";

const tree_parser = new TreeParser();
const lookup_props = LookupProps.getInstance();
// const taxo_parser = await TaxoParser.getInstance(); // Top-level Await in an ESM module
// const sub_tree_names = ["electronics_engineering", "robotics_engineering"]; // ["electronics_engineering", "robotics_engineering"]; // ["talent_acquisition_id2"]; //
// // from taxo, collect the names of a parent category e.g. "Electronics Engineering",
// // along with the ones of all of its sub-categories
// taxo_parser.toNodeEdgeColBFTinAOFwID(); // sets nodes & edges collections, in preparation for the next step
// const xlsx_patterns = deDupArr(
//   sub_tree_names.flatMap((sub_tree_name) => {
//     taxo_parser.setSubTreeStateBy(sub_tree_name);
//     return taxo_parser
//       .getTreeNodes(taxo_parser.sub_tree)
//       .map((crit) => crit?.regex_pattern)
//       .filter(Boolean)
//       .flat();
//   }),
// );

const SRC_RELATIVE_PATH =
  "Documents/Mirror/nested-normalized-profiles/inherent-tagged-profiles/inferred-tagged-profiles/longlist-cpies/deduped-cpies/";
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_RELATIVE_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory. */
const FILTERED_CPY_REL_PATH = "filtered-cpies";
const FILTERED_CPY_ABS_PATH = path.resolve(SRC_ABS_PATH, FILTERED_CPY_REL_PATH);
createDir(FILTERED_CPY_ABS_PATH);

const FILE_EXT = ".json"; // ".xlsx"; //

const cpy_map = new Map();
let merged_recs_count = 0;
let cpies_w_no_id_count = 0;
const CPY_ID_KEYS = lookup_props.company_id_keys;

const ISO8601_pattern = "\\d{4}-\\d{2}-\\d{2}T\\d{6}";
const FLAG = "im";
const rx = tryRegExp(ISO8601_pattern, FLAG);
let file_timestamp;

const electronics_patterns = [
  "Die design",
  "epoxy molding on electronic components",
  "micromachining",
];

const xlsx_patterns = [
  '"CAD"▬Model♥',
  "Anima▬Tronic",
  "Animatronic§",
  "CFD",
  "Composite▬Analysis",
  "Comput▬Fluid▬Dynamic♥",
  "Computer Aided▬Engineer♥",
  "Discrete▬Element▬Method",
  "Dynamic▬Analy♥",
  "Electro▬Mecha♥",
  "Failure Analysis",
  "Fatigue▬Analysis",
  "FEA",
  "Finite Element Analysis",
  "Fluid▬Mecha♥",
  "Impact▬2Assess♥",
  "Impact▬2Engineer♥",
  "Mecha▬2Tronic♥",
  "Mecha▬Design♥",
  "Mecha▬Engineer♥",
  "Mecha▬Material§",
  "Mecha▬Product▬Design♥",
  "Mecha▬Tronic§",
  "Mechatronic▬Engineer♥",
  "Mechatronic§",
  "Precision▬Mecha♥",
  "PSM",
  "Seismic▬Assessment",
  "Seismic▬Engineer♥",
  "Strength▬Analysis",
  "Strength▬Assess♥",
  "Stress▬Analysis",
  "Structur▬Analysis",
  "Structur▬Assess♥",
  "Structur▬Dynamic♥",
  "Structur▬Engineer♥",
  "Structur▬Optimi♥",
  "Therm▬Analysis",
  "Therm▬Assess♥",
  "Therm▬Engineer♥",
  "Transient▬Analysis",
  "Vibration Analysis",
  "Vibration Engineer♥",
  "Vibration▬Analysis",
  "Vibration▬Assess♥",
  "Vibration▬Engineer♥",
];

const false_positives = [
  "computing software. Engineers",
  "Engineering and to positively impact",
  "Failure analysis",
  "stamping",
  "Thermal Comfort • Facade Optimization",
];
const DISCIPLINE_NAME = "mechanical-engg";
const regexes = xlsx_patterns
  .map((p) => toRegExpPattern(p))
  .map((pattern) => tryRegExp(pattern, FLAG));
// const regexes = xlsx_patterns.map((pattern) => tryRegExp(pattern, FLAG));
const TARGET_KEYS = ["matching_texts"];

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    file_timestamp =
      dirent.name.match(rx)?.shift() ??
      toValidFileNameFrom(new Date().toISOString());
    try {
      /* aggregate all current company records.
        for `Company` with skillset, merge the record into a `Map()` by aggregating both,
        the top-level properties and its associated meta data */
      json_arr.forEach((cpy) => {
        // isolate ID properties into a new object that serves as a key for the Set()
        const curr_identifier = extractFromObjBy(cpy, CPY_ID_KEYS);

        // abort if `curr_identifier` is empty
        if (isEmptyObj(curr_identifier)) {
          cpies_w_no_id_count++;
          return;
        }

        tree_parser.setStateTo(cpy);

        const relevant_tags = tree_parser.getNode({
          relevant_tags: [{}],
        });

        if (!relevant_tags.length) return;

        // filter out companies that have relevant employees and more than one matching keyword
        if (relevant_tags.some((tag) => tag?.TARGET_KEYS[0].length > 1)) return;
        if (cpy?.["relevant_skillset"]) return;

        // filter out companies that have keywords already aligned with what's relevant
        const is_relevant = relevant_tags
          .flatMap((tag) => TARGET_KEYS.flatMap((key) => tag?.[key]))
          // filter out excerpts that won't contain props necessary for my analysis
          .some((kw) => regexes.some((rx) => rx.test(kw)));

        if (is_relevant) return;

        /* in JavaScript, there isn't a direct way to get the memory address or reference of an object as in lower-level languages like C or C++.
        Check if a key exists in the Map() that shares at least one property with `curr_identifier`
        Map.has() can't perform a partial match on the properties of the key objects.
        It's based on SameValueZero algorithm, which is similar to strict equality (===).
        */
        const existing_identifier_reference = Array.from(cpy_map.keys()).find(
          (id_obj) =>
            CPY_ID_KEYS.filter((k) => k in curr_identifier)
              .filter((k) => k in id_obj)
              .some((k) => id_obj?.[k] === curr_identifier?.[k]),
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
          cpy_map.set(existing_identifier_reference, cpy);
        }
      });
      await controlFlowForAwaitLoop();
    } catch (error) {
      console.error(`Error processing file ${dirent.name}:`, error);
    }
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processWriteOneFileAtATime();
    console.log(`Total number of duplicate records: ${merged_recs_count}`);
    console.log(`Total number of records without IDs: ${cpies_w_no_id_count}`);
    // inject the aggregated identifiers back into the record
    for (const [key, value] of cpy_map.entries()) {
      Object.assign(value, key);
    }
    const filtered_cpies = Array.from(cpy_map.values());

    // write to file
    const base_name = `longlist-of-${DISCIPLINE_NAME}-${
      filtered_cpies.length
    }-${FILTERED_CPY_REL_PATH}-${uuidv4()}`;
    await tryWriteFile(
      FILTERED_CPY_ABS_PATH,
      base_name,
      FILE_EXT,
      filtered_cpies,
    ); // TEST_PROFILE_ABS_PATH // FILTERED_CPY_ABS_PATH
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
