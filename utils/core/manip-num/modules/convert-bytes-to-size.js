import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts bytes to a human-readable string representation
 * https://www.geeksforgeeks.org/javascript-convert-bytes-to-human-readable-string/
 * @param {number} bytes - The number of bytes to convert
 * @param {number} [dm=2] - The number of decimal places to round the result to. Default is 2
 * @returns {string} The human-readable string representation of the bytes
 */
export function convertBytesToSize(bytes, dm = 2) {
  param_validator.validateNumber(bytes);
  param_validator.validateNumber(dm);

  if (bytes === 0) return "0 Bytes";
  var k = 1024;
  let e = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat(bytes / Math.pow(k, e)).toFixed(dm)} ${
    " KMGTP".charAt[e]
  }B`;
}
