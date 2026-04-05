import fs from "fs";
import path from "path";
import { fetchDirentContentFromLocalDir } from "../../../utils/index.js";

const SRC_FOLDER_PATH =
  "OneDrive/Bureau/canBeDeleted_exeksourcingData/DB_listOfCpies_AU_energy/ETL"; //"PATH/TO/YOUR/DIRECTORY"; // replace with your own path to directory containing your .json files
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_FOLDER_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory.
`.resolve()` turns sequences of paths into an absolute path */
const DEDUP_RELATIVE_PATH = "test-json";
const DEST_ABS_PATH = path.resolve(SRC_ABS_PATH, DEDUP_RELATIVE_PATH);
if (!fs.existsSync(DEST_ABS_PATH)) {
  fs.mkdirSync(DEST_ABS_PATH);
}
const FILE_EXT = ".json"; //".xlsx"; //

const dirents_n_jsonFiles = await fetchDirentContentFromLocalDir(
  SRC_ABS_PATH,
  FILE_EXT,
  true,
);

const dirents_n_res = dirents_n_jsonFiles.map((dirent_n_json) => {
  try {
    const { dirent, json_file } = dirent_n_json;
    return {
      dirent,
      res: "dummy data", // your computation here e.g. validateJSON.toNestedGroupedValidJSON(json_file)
    };
  } catch (error) {
    console.error(error);
  }
});

// Write data to the file
dirents_n_res.map((dirent_n_res) => {
  const { dirent, res } = dirent_n_res;
  const file_path = path.join(
    DEST_ABS_PATH,
    dirent.name.replace(FILE_EXT, ".json"),
  );
  fs.writeFile(file_path, JSON.stringify(res, null, 2), (err) => {
    if (err) {
      console.error("Error writing file: ", err);
    } else {
      console.log("Successfully converted file: ", dirent.name);
    }
  });
});
