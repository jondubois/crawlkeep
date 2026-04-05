import param_validator from "../../../../classes/modules/param-validator.js";
const ISO8601_PATTERN =
  "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?(?:Z|[+-]\\d{2}:\\d{2})?";

/**
 * @description Converts an ISO 8601 date string to a Unix timestamp.
 * @param {String} iso_date - The date in ISO 8601 format (e.g., 2024-03-16T00:43:16).
 * @return {String} - The date in Unix timestamp format.
 */
export function toUnixTimestampFromIso8601(iso_date) {
  param_validator.validateNumber(iso_date);

  const isoPattern = new RegExp(ISO8601_PATTERN);
  const match = iso_date.match(isoPattern);

  if (!match) {
    throw new Error("Invalid ISO 8601 date string");
  }

  const date = new Date(iso_date);

  // Convert to Unix timestamp (in milliseconds)
  const unixTimestamp = date.getTime();

  // Return the Unix timestamp as a string
  return unixTimestamp.toString();
}

// // usage
// const iso_date = "2024-03-16T00:43:16";
// const unixTimestamp = convertIso8601ToUnix(iso_date);
// console.log(unixTimestamp); // Output: 1710542596000
// console.log("unix_timestamp", new Date(parseInt(unixTimestamp)).toISOString()); // Output: 2024-03-16T00:43:16.000Z
