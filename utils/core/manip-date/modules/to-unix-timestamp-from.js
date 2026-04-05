import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts an Excel serial date to a Unix timestamp in milliseconds.
 * Excel serial dates are based on the number of days since January 1, 1900, with some quirks:
 * - January 1, 1900 is considered day 1.
 * - Excel incorrectly treats 1900 as a leap year, so February 29, 1900 is considered a valid date.
 * This function accounts for these quirks.
 *
 * @param {number} excel_serial_date - The Excel serial date to be converted. Must be a valid number.
 * @return {number} The Unix timestamp in milliseconds corresponding to the given Excel serial date.
 */
export function toUnixTimestampFrom(excel_serial_date) {
  param_validator.validateNumber(excel_serial_date);

  const date = new Date(Date.UTC(1900, 0, 1));
  return date.setDate(date.getDate() + excel_serial_date) - 2; // 1) Jan 1, 1900 is day 1 (not the number of days since Jan 1, 1900)
  // 2) according to Excel Feb 29, 1900 exists(a bug in their code they refuse to fix.
}
