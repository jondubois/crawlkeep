import XLSX from "xlsx";

// external imports
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts an array of file contents into a flattened array of JSON objects.
 *              Supports `.json` and `.xlsx` file extensions.
 * @param {Array<Buffer>} contents - An array of Buffer objects representing file contents.
 * @param {string} file_ext - The file extension of the contents (e.g., ".json", ".xlsx").
 * @return {Promise<Array<Object>>} A promise that resolves to a flattened array of JSON objects.
 */
export async function convertBufferToJSONflat(contents, file_ext) {
  param_validator.validateArray(contents);
  param_validator.validateString(file_ext);

  const sheet_contents = await Promise.all(
    contents.map((buffer) => {
      switch (file_ext) {
        case ".json":
          return JSON.parse(buffer.toString());
        case ".xlsx": {
          const workbook = XLSX.read(buffer, { type: "buffer" });
          return workbook.SheetNames.flatMap((sheet_name) => {
            return XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name]);
          });
        }
        default:
          console.log(`Sorry, the extension ${file_ext} is not supported.`);
      }
    }),
  ).catch((error) => {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing convertBufferToJSONflat(), Error: ${error.message}`;
    throw error;
  });
  return sheet_contents.flat(Infinity); // no more workbooks, only keeps the sheet contents
}

/**
 * @description Converts an array of file contents into an array of arrays of JSON objects.
 *              Supports `.json` and `.xlsx` file extensions.
 * @param {Array<Buffer>} contents - An array of Buffer objects representing file contents.
 * @param {string} file_ext - The file extension of the contents (e.g., ".json", ".xlsx").
 * @return {Promise<Array<Array<Object>>>} A promise that resolves to an array of arrays of JSON objects.
 */
export async function convertBufferToJSON(contents, file_ext) {
  param_validator.validateArray(contents);
  param_validator.validateString(file_ext);

  return Promise.all(
    contents.map((buffer) => {
      switch (file_ext) {
        case ".json":
          return JSON.parse(buffer.toString());
        case ".xlsx": {
          const workbook = XLSX.read(buffer, { type: "buffer" });
          return workbook.SheetNames.map((sheet_name) => {
            return XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name]);
          });
        }
        default:
          console.log(`Sorry, the extension ${file_ext} is not supported.`);
      }
    }),
  ).catch((error) => {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing convertBufferToJSON(), Error: ${error.message}`;
    throw error;
  });
}

/**
 * @description Converts a single buffer into a flattened array of JSON objects synchronously.
 *              Supports `.json` and `.xlsx` file extensions.
 * none of the operations are asynchronous, so, it was converted back to a synchronous function
 * @param {Buffer} buffer - A Buffer object representing the file content.
 * @param {string} file_ext - The file extension of the content (e.g., ".json", ".xlsx").
 * @return {Array<Object>} A flattened array of JSON objects.
 */
export function convertBufferToJSONflat1(buffer, file_ext) {
  param_validator.validateBuffer(buffer);
  param_validator.validateString(file_ext);

  try {
    switch (file_ext) {
      case ".json":
        return JSON.parse(buffer.toString());
      case ".xlsx": {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        return workbook.SheetNames.flatMap((sheet_name) => {
          return XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet_name],
          ); /* `{ header: 0 }` (Default):
          - Uses the first row of the sheet as the keys for the JSON objects.
          - The first row is treated as column headers, and subsequent rows are converted into objects. */
        });
      }
      default:
        console.log(`Sorry, the extension ${file_ext} is not supported.`);
    }
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing convertBufferToJSONflat1(), Error: ${error.message}`;
    throw error;
  }
}
