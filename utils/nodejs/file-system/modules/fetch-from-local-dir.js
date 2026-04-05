import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { getFileContentsFromDir } from "./get-file-contents-from-dir.js";
import { convertBufferToJSONflat1 } from "./convert-buffer-to-json.js";

import param_validator from "../../../../classes/modules/param-validator.js";

// QuickLi > "Full Company Data from LinkedIn Company URLs" returns a .tsv file.
// First, the .tsv is to be imported in .xlsx, using PowerQuery.
// From local directory, get all files and sub-files's paths,
// then get their content and return them concatenated in an array of JSON objects

/**
 * @description Fetches data from a local directory by getting the content of all files and sub-files in user defined directory,
 * according to user defined file extension.
 * The content of the files is returned as an array of JSON objects.
 * @param {string} path_myDirectory - The path to the directory containing the files.
 * @param {string} FILE_EXT - The file extension of the files to be fetched.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of JSON objects representing the content of the files.
 * @throws {Error} - If no file of the specified extension is found in the directory.
 */
export async function fetchJSONfromLocalDir(
  path_myDirectory,
  FILE_EXT,
  is_recursive = false,
) {
  param_validator.validateString(path_myDirectory);
  param_validator.validateString(FILE_EXT);
  param_validator.validateBoolean(is_recursive);

  try {
    const file_contents = await getFileContentsFromDir(
      path_myDirectory,
      FILE_EXT,
      is_recursive,
    );
    // /!\ memory jam - aggregates in one JSON all Objects contained in every files
    return await Promise.all(
      file_contents.flatMap((content) =>
        convertBufferToJSONflat1(content, FILE_EXT),
      ),
    ); // { dirent, content }
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing fetchJSONfromLocalDir(), Error: ${error.message}`;
    throw error;
  }
}

/**
 * @description From an absolute path to a directory and extension type,
 * gets all files and sub-files's paths,
 * then retrieves their content,
 * finally returns an array of objects containing the file dirent and the parsed content based on the extension type.
 * @param {string} dir_path - The absolute path to the target directory.
 * @param {string} ext - The file extension to filter by.
 * @returns {Promise<Array<{dirent: fs.Dirent, json_file: Object}>>} - A promise that resolves to an array of objects containing the file dirent and the parsed content.
 * @throws {Error} - If no file of the specified extension is found in the directory.
 */
export async function fetchDirentContentFromLocalDir(
  dir_path,
  ext,
  is_recursive = false,
) {
  param_validator.validateString(dir_path);
  param_validator.validateString(ext);
  param_validator.validateBoolean(is_recursive);

  try {
    const dirents = await fs.promises.readdir(dir_path, {
      withFileTypes: true,
      recursive: is_recursive,
    });
    const file_dirents = dirents.filter(
      (dirent) => dirent.isFile() && path.extname(dirent.name) === ext,
    );
    if (file_dirents.length === 0)
      throw new Error(`No file of extension ${ext} in directory`);

    const dirents_n_contents = await Promise.all(
      file_dirents.map(async (dirent) => {
        // https://nodejs.org/api/fs.html#direntparentpath
        const parent_path = dirent.parentPath ?? dirent.path;
        const abs_path = path.resolve(parent_path, dirent.name);
        const content = await fs.promises.readFile(abs_path).catch((err) => {
          console.error("Failed to read files", err.message); // default content format is Buffer
          return Buffer.alloc(0); // Return an empty buffer in case of an error
        });
        return { dirent, content };
      }),
    );
    return dirents_n_contents.map((dirent_n_content) => {
      const { dirent, content } = dirent_n_content;
      switch (ext) {
        case ".json":
          return { dirent, json_file: JSON.parse(content.toString()) };
        case ".xlsx": {
          const workbook = XLSX.read(content, { type: "buffer" });
          const workbook_json = workbook.SheetNames.flatMap((sheetName) => {
            return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          });
          return {
            dirent,
            json_file: workbook_json,
          };
        }
        default:
          console.log(`Sorry, the extension ${ext} is not supported.`);
          return { dirent, json_file: {} };
      }
    });
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing fetchDirentContentFromLocalDir(), Error: ${error.message}`;
    throw error;
  }
}

// André's version
var tryJSONparse = (s) => {
  try {
    return JSON.parse(s);
  } catch (err) {
    return [];
  }
};

export function getJSONdataInFolder(params) {
  var contain_arr = [];
  let files = fs
    .readdirSync(params.target_folder)
    .filter((fileName) => /\.json$/.test(fileName));
  for (let i = 0; i < files.length; i++) {
    let file = fs.readFileSync(params.target_folder + "/" + files[i]);
    let data = tryJSONparse(file);
    contain_arr.push(data);
  }
  return contain_arr.flat();
}

/* getJSONdataInFolder({
  target_folder: "./your target folder name",
}); */
