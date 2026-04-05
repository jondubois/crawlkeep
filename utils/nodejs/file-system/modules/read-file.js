import fs from "fs";
import { convertBufferToJSONflat1 } from "./convert-buffer-to-json.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Reads a file and returns its content as a JSON object.
 * @param {string} file_path - path to the file
 * @param {string} file_ext - file extension (".json" or ".xlsx")
 * @returns {Promise<Object>} - JSON object
 * @throws {Error} - If no file of the specified extension is found in the directory.
 */
export async function readFile(file_path, file_ext) {
  param_validator.validateString(file_path);
  param_validator.validateString(file_ext);
  try {
    const content = await fs.promises.readFile(file_path);
    return await convertBufferToJSONflat1(content, file_ext);
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing readFile(), Error: ${error.message}`;
    throw error;
  }
}
