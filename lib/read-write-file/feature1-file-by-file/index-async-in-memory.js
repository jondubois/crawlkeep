import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  tryWriteFile,
  tryRegExp,
  readOneFileAtATime,
} from "../../../utils/index.js";

const SRC_RELATIVE_PATH =
  "Documents/exeksourcing-data/scraped_content/DB/DB_engineering_AU/DB_sftwEngineering/data-dump-26042024/deduped-json/canBeDeleted";
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_RELATIVE_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory. */
const DEST_FOLDER_PATH = SRC_ABS_PATH;
const DEDUP_RELATIVE_PATH = "test-recs";
const DEST_ABS_PATH = path.resolve(DEST_FOLDER_PATH, DEDUP_RELATIVE_PATH);
if (!fs.existsSync(DEST_ABS_PATH)) {
  fs.mkdirSync(DEST_ABS_PATH);
}

const FILE_EXT = ".json"; // .xlsx
const ISO8601_pattern = "\\d{4}-\\d{2}-\\d{2}T\\d{6}";
const FLAG = "gim";
const rx = tryRegExp(ISO8601_pattern, FLAG);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  /* `reader`is an async iterable object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of#iterating_over_async_generators)
  The `for await...of` loop is used to iterate over async iterables.
  In other words, `reader` is consumed by the `for await...of` loop,
  which handles backpressure as follows:
    1 .`reader` provides batches of data when requested by the consumer ie. the `for await...of` loop.
    2. `for await...of` loop throttles or pauses iteration to wait for
    the Promise returned by the iterator's `.next()` method to resolve before proceeding to the next iteration
    3. `for await...of` loop processes the data in the batch
    4. `for await...of` loop requests the next batch from `reader` */
  for await (const { dirent, json_arr } of reader) {
    const file_timestamp =
      rx instanceof RegExp
        ? dirent.name.match(rx)?.shift()
        : new Date().getTime();
    try {
      // synchronous processing of `json_arr`

      // write to file
      const base_name = `from-file-${file_timestamp}-${DEDUP_RELATIVE_PATH}-${
        nested_serialised_recs.length
      }-recs-${uuidv4()}`;
      await tryWriteFile(ABS_PATH, base_name, FILE_EXT, json_arr); // TEST_PROFILE_ABS_PATH
      /* To control the flow of the `for await...of` loop, I used the promisified version `fs.promises.writeFile()`.
    `fs.promises.writeFile()` returns a Promise, which is why `tryWriteFile()` was made async.
    The `for await...of` loop releases one file at a time.
    Thereby, inside the loop, the processing of `json_arr` is synchronous.
    Therefore, it's the `for await...of` loop that's responsible for putting backpressure on `fs.promises.writeFile()`.  
    To handle it, `tryWriteFile()` controls the `for await...of` loop's flow by pausing its execution with
    `await` a Promise that settles when `fs.promises.writeFile()` is finished writing data to file. */
    } catch (error) {
      console.error(`Error processing file: ${file_timestamp}`, error);
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
