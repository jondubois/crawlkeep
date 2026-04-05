import { tryRegExp } from "../../manip-str/index.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts a compact ISO-like date string (e.g., "2024-04-23T123504.123")
 * into a Unix timestamp in milliseconds. The input format must follow "YYYY-MM-DDTHHMMSS(.sss)".
 *
 * @param {string} compact_date - The compact ISO-like date string to be converted.
 * Must be in the format "YYYY-MM-DDTHHMMSS(.sss)".
 * @return {number} The Unix timestamp in milliseconds corresponding to the given date string.
 */
const COMPACT_DATE_PATTERN = "\\d{4}-\\d{2}-\\d{2}T\\d{6}(?:\\.\\d{1,3})?";

export function toUnixTimestampFromCompactFormat(compact_date) {
  param_validator.validateString(compact_date);

  // Use tryRegExp to validate the compact date format
  if (!tryRegExp(`^${COMPACT_DATE_PATTERN}$`).test(compact_date)) {
    throw new ReferenceError(
      `${toUnixTimestampFromCompactFormat.name} - Invalid compact date format. Expected "YYYY-MM-DDTHHMMSS(.sss)". Instead, was passed ${compact_date}`,
    );
  }

  // Extract and format the time part (HHMMSS -> HH:MM:SS)
  const formatted_time = `${compact_date.slice(11, 13)}:${compact_date.slice(
    13,
    15,
  )}:${compact_date.slice(15, 17)}`;

  // Parse the ISO string into a Date object
  const date = new Date(`${compact_date.slice(0, 10)}T${formatted_time}`);

  return date.getTime();
}
