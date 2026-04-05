import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts an Excel serial date to a JavaScript Date object in ISO 8601 format ("YYYY-MM-DDT00:00:00.000Z").
 * @param {number} excel_serial_date - The Excel serial date.
 * @return {Date|null} - The date in ISO 8601 format, or null if invalid.
 */
export function toIso8601JSdateFromNum(excel_serial_date) {
  param_validator.validateNumber(excel_serial_date);
  if (excel_serial_date < 1 || excel_serial_date > 2958465) {
    throw new RangeError(`Invalid Excel serial date: ${excel_serial_date}`); // Excel serial dates must be positive and within the range of valid dates
  }

  try {
    const excel_base_date = new Date(Date.UTC(1900, 0, 1));
    const days_since_base_date = excel_serial_date - 2; // subtracts 1 for 1-based indexing and 1 for leap year bug
    const js_date = new Date(
      excel_base_date.getTime() + days_since_base_date * 86400000,
    ); // adds days in milliseconds

    return !isNaN(js_date.getTime()) ? js_date : null;
  } catch (error) {
    throw new Error(
      `Whilst processing toIso8601JSdateFromNum(), Error: ${error.message}`,
    );
  }
}

// // Example usage
// const excel_serial_date = 45272;
// const jsDate = excelSerialDateToJSDate(excel_serial_date);
// console.log(jsDate.toISOString()); // Output: "2023-12-01T00:00:00.000Z"
