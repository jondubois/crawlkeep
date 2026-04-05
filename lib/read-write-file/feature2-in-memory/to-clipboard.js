import path from "path";
import {
  fetchJSONfromLocalDir,
  copyToClipboard,
} from "../../../utils/index.js";

const SRC_RELATIVE_PATH =
  "Documents/Mirror/exeksourcing-data/scraped_content/DB/DB_engineering_AU/DB_sftwEngineering/data-dump-26042024/inherent-tagged-profiles/longlist-cpies";
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_RELATIVE_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory. */
const FILE_EXT = ".json"; // ".xlsx"; //

console.log(`Current PID: ${process.pid}`);

async function processAndCopyToClipboard() {
  try {
    // /!\ memory jam - aggregates in one JSON all Objects contained in every files
    const json_objs = await fetchJSONfromLocalDir(SRC_ABS_PATH, FILE_EXT);

    const res = json_objs.map((cpy) => cpy);

    await copyToClipboard(JSON.stringify(res[0], null, 2), null, 2);
  } catch (error) {
    console.error(`Error processing file:`, error);
  }
}

async function main() {
  console.time("Script Execution Time");
  try {
    await processAndCopyToClipboard();
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

// fetchJSONfromLocalDir(SRC_ABS_PATH, FILE_EXT)
//   .then((json_objs) => {
//     return json_objs.map((flat_obj) => {
//       // validate and mutate nested JSON to valid JSON
//       let validated_obj = mutateDTOuser(flat_obj, userSchemaValidator);
//       // transform flat JSON to nested JSON
//       return dataMining.toSerialisedProps(validated_obj, raw_patterns);
//     });
//   })
//   .then((res) => copyToClipboard(JSON.stringify(res[0], null, 2), null, 2))
//   .catch((err) => console.error(err));

// fetchJSONfromLocalDir(SRC_ABS_PATH, FILE_EXT)
//   .then((json_arr) => {
//     return json_arr.reduce(aggregateSample, {}); // `.reduce()` executes a reducer function (aggregateSample) on each element of the array
//   })
//   .then((obj) => {
//     let sorted = sortKeysAlphabetically(obj);
//     copyToClipboard(JSON.stringify(sorted, null, 2), null, 2); // Object.keys(sorted)
//     console.log("Copied to clipboard");
//   })
//   .catch((err) => console.error(err));
