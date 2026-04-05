import fs from "fs";
import path from "path";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description From an absolute path to a directory and extension type,
 * gets all files and sub-files's paths
 * @param {string} dir_path - The absolute path to the target directory.
 * @param {string} file_ext - The file extension to filter by.
 * @param {boolean} [is_recursive=false] - Whether to get all files recursively.
 * @returns {string[]} - An array of file paths.
 * @throws {Error} - If no file of the specified extension is found in the directory.
 */
export function getFilePaths(dir_path, file_ext, is_recursive = false) {
  param_validator.validateString(dir_path);
  param_validator.validateString(file_ext);
  param_validator.validateBoolean(is_recursive);

  try {
    const dirents = fs.readdirSync(dir_path, { withFileTypes: true });
    let filePaths = [];

    for (const dirent of dirents) {
      const abs_path = path.resolve(dir_path, dirent.name);
      if (dirent.isDirectory() && is_recursive) {
        filePaths = filePaths.concat(
          getFilePaths(abs_path, file_ext, is_recursive),
        );
      } else if (dirent.isFile() && path.extname(dirent.name) === file_ext) {
        filePaths.push(abs_path);
      }
    }

    return filePaths;
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing getFilePaths() - Failed to read file paths, Error: ${error.message}`;
    throw error;
  }
}
