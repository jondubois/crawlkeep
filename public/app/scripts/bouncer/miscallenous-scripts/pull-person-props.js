import path from "path";
import { readOneFileAtATime } from "../../lib/read-write-file/modules/read-one-file-at-a-time.js";
import { tryWriteFile, createDir } from "../../utils/file-system/index.js";
import { deDupArr } from "../../utils/manip-arr/modules/misca.js";

// file-system
const SRC_REL_PATH =
  "Documents/exeksourcing-data/scraped_content/DB/DB_engineering_AU/DB_sftwEngineering/data-dump-26042024/nested-normalized-profiles/inherent-tagged/inferred-tagged/can-be-deleted";
const getAbsPath = (rel_path) =>
  path.resolve(process.env.HOME || process.env.USERPROFILE || "", rel_path);
const SRC_ABS_PATH = getAbsPath(SRC_REL_PATH);
const DEST_DIR_REL_PATH = "li-urls-of";
const DEST_DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DEST_DIR_REL_PATH);
createDir(DEST_DIR_ABS_PATH);

async function processWriteOneFileAtATime() {
  const reader = readOneFileAtATime(SRC_ABS_PATH, FILE_EXT);
  for await (const { dirent, json_arr } of reader) {
    try {
      const unique_urls = deDupArr(
        json_arr.flatMap((person) => person?.public_url ?? []),
      );
      // write to file
      const base_name = `${DEST_DIR_REL_PATH}-${unique_urls.length}-persons`;
      await tryWriteFile(DEST_DIR_ABS_PATH, base_name, FILE_EXT, unique_urls);
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

// handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
