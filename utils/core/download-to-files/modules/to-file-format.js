import XLSX from "xlsx";
import { getFileExtension } from "./get-file-extension.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Converts the given array into a Blob of the given file name.
 * @param {Array<Array<string|number>>} arr - The array to be converted.
 * @param {string} file_name - The name of the file to be downloaded.
 * @return {{data: string, type: string}} - An object with two properties: {data, type}.
 */
export function toFileFormat(arr, file_name) {
  param_validator.validateArray(arr);
  param_validator.validateStringIsNotEmpty(file_name);

  const extension = getFileExtension(file_name);
  let data;
  let type;

  switch (extension) {
    case "json":
      data = JSON.stringify(arr, null, 2);
      type = "data:application/json;charset=utf-8,"; // {MIMEType} aka "media type", aka "content type" (https://www.iana.org/assignments/media-types/media-types.xhtml)
      break;
    case "csv":
      data = arr.map((row) => row.join(",")).join("\n");
      type = "data:text/csv;charset=utf-8,";
      break;
    case "tsv":
      data = arr.map((row) => row.join("\t")).join("\n");
      type = "data:text/tab-separated-values;charset=utf-8,";
      break;
    case "txt":
    default:
      data = arr.map((row) => row.join(" ")).join("\n");
      type = "data:text/plain;charset=utf-8,";
      break;
  }

  return { data, type };
}

/**
 * @description Prepares the given 2D array for download by converting it into the specified file format.
 * @param {Array<Array<string|number>>} arr - The 2D array to be converted.
 * @param {string} base_name - The name of the file (without extension).
 * @param {string} ext - The extension of the file (e.g., "json", "csv", "tsv", "txt", "xlsx").
 * @return {{data: string|Blob, type: string, filename: string}} - An object with the prepared data, MIME type, and full file name.
 */
export function toPrepedForDownload(arr, base_name, ext) {
  param_validator.validateArray(arr);
  param_validator.validateStringIsNotEmpty(base_name);
  param_validator.validateStringIsNotEmpty(ext);

  let data;
  let type;

  switch (ext.toLowerCase()) {
    case "json":
      data = JSON.stringify(arr, null, 2);
      type = "data:application/json;charset=utf-8,";
      break;
    case "csv":
      data = arr.map((row) => row.join(",")).join("\n");
      type = "data:text/csv;charset=utf-8,";
      break;
    case "tsv":
      data = arr.map((row) => row.join("\t")).join("\n");
      type = "data:text/tab-separated-values;charset=utf-8,";
      break;
    case "xlsx": {
      // Convert the array to a worksheet ..
      const worksheet = XLSX.utils.aoa_to_sheet(arr); // converts 2D array of arrays to worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      // ..then to a Blob
      const xlsxBlob = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      data = new Blob([xlsxBlob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      type =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      break;
    }
    case "txt":
    default:
      data = arr.map((row) => row.join(" ")).join("\n");
      type = "data:text/plain;charset=utf-8,";
      break;
  }

  return { data, type, filename: constructFileName(base_name, ext) };
}

/**
 * @description Constructs a filename by combining the base name and extension.
 * @param {string} base_name - The base name of the file (without extension).
 * @param {string} extension - The file extension (e.g., "json", "csv").
 * @return {string} - The constructed file name.
 */
function constructFileName(base_name, extension) {
  param_validator.validateStringIsNotEmpty(base_name);
  param_validator.validateStringIsNotEmpty(extension);
  const SEPERATOR = "-"; // separator between base name and extension

  // Sanitize inputs
  const sanitized_base_name = base_name
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, SEPERATOR);
  const sanitized_extension = extension
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const timestamp = new Date().getTime();

  return [sanitized_base_name, timestamp]
    .filter(Boolean)
    .join(SEPERATOR)
    .concat(`.${sanitized_extension}`);
}
