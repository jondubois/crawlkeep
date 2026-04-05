import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts a date string to a valid file name by replacing all non-allowed characters.
 * @param {string} date_str - The date string to be converted.
 * @return {string} - The valid file name.
 */
export function toValidFileNameFrom(date_str) {
  param_validator.validateString(date_str);

  const replacement_container = {
    ":": "-",
    "/": "-",
    "\\": "-",
    "?": "",
    "*": "",
    "<": "",
    ">": "",
    "|": "",
    '"': "",
    " ": "_",
  };

  // Replace each character in the map
  let valid_file_name = date_str;
  for (const [char, replacement] of Object.entries(replacement_container)) {
    valid_file_name = valid_file_name.split(char).join(replacement);
  }

  return valid_file_name;
}

// // Example usage
// const date_str = "2024-11-06T00:55:14.568Z";
// const valid_file_name = toValidFileNameFrom(date_str);
// console.log(valid_file_name); // Output: 2024-11-06T00-55-14.568Z
