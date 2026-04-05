import fs from "fs";
const { access } = fs.promises;
import param_validator from "../../../classes/modules/param-validator.js";

/**
 * @description Checks if a file or directory exists.
 * @param {string} dir_or_file_path - The path to the file or directory.
 */
// check if a file or directory exists
export async function existsEntry(dir_or_file_path) {
  param_validator.validateString(dir_or_file_path);

  try {
    await access(dir_or_file_path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
