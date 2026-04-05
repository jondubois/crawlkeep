import fs from "fs";
import path from "path";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description From an absolute path to a directory and extension type,
 * gets all files and sub-files's paths,
 * then retrieves their content,
 * finally returns them concatenated in an array of Buffer objects.
 * @param {string} dir - The absolute path to the target directory.
 * @param {string} ext - The file extension to filter by.
 * @returns {Promise<Array<Buffer>>} - A promise that resolves to an array of file contents as Buffer objects.
 * @throws {Error} - If no file of the specified extension is found in the directory.
 */
// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
export async function getFileContentsFromDir(
  dir_path,
  file_ext,
  is_recursive = false,
) {
  param_validator.validateString(dir_path);
  param_validator.validateString(file_ext);
  param_validator.validateBoolean(is_recursive);
  try {
    const dirs = await fs.promises.readdir(dir_path, {
      recursive: is_recursive,
    });
    const file_dirs = dirs.filter(
      (dir) => path.extname(dir) === file_ext,
    );

    if (!file_dirs.length)
      throw new Error(`No file of extension ${file_ext} in directory`);

    const results = await Promise.all(
      file_dirs.map(async (file_name) => {
        const abs_path = path.resolve(dir_path, file_name);
        const content = await fs.promises.readFile(abs_path).catch((err) => {
          console.error("Failed to read files", err.message); // default content format is Buffer
          return Buffer.alloc(0); // Return an empty buffer, as a fallback value in case of error
        });
        return content;
      }),
    );

    return results;
  } catch (error) {
    console.error("Error in getFileContentsFromDir:", error.message);
    throw error; // re-throw the error to be handled by the caller if needed
  }
}