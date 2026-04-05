import { performance, PerformanceObserver } from "perf_hooks";
import { parentPort, workerData } from "worker_threads";
import path from "path";
import { readFile } from "../utils/file-system/modules/read-file.js";
import {
  tryWriteFile,
  tryWriteFileSync,
} from "../utils/file-system/modules/try-write-file.js";
import { getInternalNode } from "../utils/manip-node/modules/get-internal-node.js";
import { isEmptyObj } from "../utils/check/modules/is-empty-obj.js";
import { tryRegExp } from "../utils/manip-str/modules/try-regexp.js";
import {
  convertMillisecondsToDuration,
  determineLastTwoUnitsToDisplay,
} from "../utils/manip-date/modules/convert-milliseconds-to-duration.js";

import { MetaParser } from "../LI_profile_parsing/classes/parser/meta-parser.js";
import { MetaStrategy } from "../LI_profile_parsing/classes/base/base-strategy.js";
import { LookupProps } from "../LI_profile_parsing/classes/base/base-entity.js";
import { TagStrategy } from "../LI_profile_parsing/classes/strategy/tag-strategy.js";

const FLAG = "gim";
const FILE_EXT = ".json";
const SIMPLIFIED_ISO8601_PATTERN = "\\d{4}-\\d{2}-\\d{2}T\\d{6}";
const UNIX_TIMESTAMP_PATTERN = "\\d{13}";
const date_rx = tryRegExp(SIMPLIFIED_ISO8601_PATTERN, FLAG);
const unix_rx = tryRegExp(UNIX_TIMESTAMP_PATTERN, FLAG);

const meta_parser = MetaParser.getInstance();
const meta_strategy = MetaStrategy.getInstance();
const tag_strategy = TagStrategy.getInstance();
const lookup_props = LookupProps.getInstance();
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const ENTITY_NAMES = lookup_props.entity_names;

// performance monitoring
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const duration = determineLastTwoUnitsToDisplay(
      convertMillisecondsToDuration(entry.duration),
    );
    const report = {
      file_path: entry.name,
      duration_ms: entry.duration,
      start_time_ms: entry.startTime,
      end_time_ms: entry.startTime + entry.duration,
      end_date: new Date(entry.startTime + entry.duration),
      duration,
    }; // `PerformanceEntry` does not support custom properties, so the file name had to be passed as the `name` of the process
    try {
      tryWriteFileSync(
        workerData.PERF_ABS_PATH,
        `performance-report-${workerData.worker_id}`,
        FILE_EXT,
        report,
      ); /* overwrites any pre-existing report, to only keep the latest.
      One report per Worker though so as to not all writing to the same file, which could cause conflicts */
    } catch (error) {
      console.error(`Error writing performance report: ${error}`);
    }
  }
});
obs.observe({ entryTypes: ["measure"], buffered: true });

async function processFile(file_path) {
  const { name } = path.parse(file_path);

  performance.mark(`start`);
  const json_arr = await readFile(file_path, FILE_EXT);
  const file_timestamp =
    file_path.match(date_rx)?.shift() ?? file_path.match(unix_rx)?.shift(); // new Date().getTime();
  try {
    /* Step0 - according to what's intrinsic / inherent to the data,
        tag all entities of the ERD (`Person`, `Job`, `Company`, etc) 
        against the criteria in taxonomy, where applicable.
        Each property shall have its respective tag, if a match is found
        e.g. 
          {
            tags: {
              inherent: {
                headline: {
                  middle_management: {},
                },
              },
            }
          }
      */
    meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
    ENTITY_NAMES.forEach((name) => {
      /* in the background, `InherentQueryMaker` instantiates and sets the state of `TaxoMaker`,
        which in turn, instantiates and sets the state of `BooleanParser` */
      tag_strategy.initializeTaxoMakerBooleanParser(name);
      lookup_props.setStateTo(name);

      // tag entity
      json_arr.forEach((rec) => {
        const source = getInternalNode(rec, lookup_props.mask_to_entity);
        source.forEach((entity) => {
          const tags_node_tree = tag_strategy.getTagsFromText({
            source: entity,
            lookup_keys: lookup_props.text_keys,
          });

          if (isEmptyObj(tags_node_tree)) return;

          meta_parser.setMetaParserStateTo(entity);
          meta_parser.addMeta([""], tags_node_tree);
        });
      }); // mutates in-place
    });
    // write to file
    const base_name = `from-${file_timestamp}-${workerData.DIR_REL_PATH}-${json_arr.length}-profiles`; // -by-${workerData.worker_id}
    await tryWriteFile(workerData.DIR_ABS_PATH, base_name, FILE_EXT, json_arr);
  } catch (error) {
    console.error(`Error processing file: ${file_timestamp}`, error);
  }
  performance.mark(`end`);
  performance.measure(name, `start`, `end`);
}

async function processBatch(paths_batch) {
  for (const file_path of paths_batch) {
    try {
      await processFile(file_path);
    } catch (error) {
      console.error(
        `Error processing batch file: ${path.parse(file_path).name}`,
        error,
      );
    }
  }
  parentPort.postMessage("done");
}

processBatch(workerData.paths_batch);
