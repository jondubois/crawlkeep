import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @requires by default, Excel assumes the MM/DD/YYYY format for string dates; irrespective of regional settings
 * @description Converts a date in "DD/MM/YYYY" format to a JavaScript Date object in ISO 8601 format ("YYYY-MM-DDT00:00:00.000Z").
 * @param {string} DDMMYYYY - The date in "DD/MM/YYYY" format.
 * @return {Date|null} - The date in ISO 8601 format, or null if invalid.
 */
export function toIso8601JSdateFromStr(DDMMYYYY) {
  param_validator.validateString(DDMMYYYY);
  try {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(DDMMYYYY))
      throw new TypeError(
        `Invalid date format. Expected ${DDMMYYYY} to in the format DDMMYYYY. Instead, was passed ${typeof DDMMYYYY}`,
      );

    const [day, month, year] = DDMMYYYY.split("/").map(Number);
    if (!day || !month || !year)
      throw new RangeError(
        `Invalid date. Expected ${DDMMYYYY} to be a valid date. Instead, was passed ${typeof DDMMYYYY}`,
      );
    const js_date = new Date(year, month - 1, day); // `.getMonth()` is 0-indexed, `.getUTCDate()` is 1-based in JS Date
    return !isNaN(js_date.getTime()) ? js_date : null;
  } catch (error) {
    throw new Error(
      `Whilst processing toIso8601JSdateFromStr(), Error: ${error.message}`,
    );
  }
}
