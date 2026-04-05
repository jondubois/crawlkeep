import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Attempts to convert a string to a valid JSON object.
 * @param {string} json_str - string to be converted to valid JSON
 * @param {number} [attempt=0] - number of times to attempt to correct the string
 * @returns {object|string} - valid JSON object or an empty string if it failed
 */
export function toValidJson(json_str, attempt = 0) {
  param_validator.validateString(json_str);
  param_validator.validateNumber(attempt);

  if (!json_str.trim()) {
    return json_str;
  }

  const regex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
  try {
    let obj = JSON.parse(json_str);
    if (obj && typeof obj === "object") {
      return obj;
    }
    // return "";
  } catch (err) {
    if (attempt > 0) {
      console.error(`Could not correct ${json_str} to valid JSON`);
      return "";
    }
    switch (err.constructor) {
      case SyntaxError:
        // missing quotes around keys
        json_str = json_str
          .replace(/([{,])(\s*)([\w\-]+?)\s*:/g, '$1"$3":')

          // trailing comma
          .replace(/,(\s*[}\]])/g, "$1")

          // Escape special characters
          .replace(/\\/g, "\\\\")
          .replace(/(\w+){/g, "$1 curlybrace ")
          .replace(/(\w+)}/g, "$1 curlybrace ")
          .replace(/{(\w+)/g, "curlybrace $1")
          .replace(/}(\w+)/g, "curlybrace $1")

          // remove all whitespace
          .trim()
          .replace(/\s+/g, " ")

          // remove all control characters except for,
          // tab (U+0009), line feed (U+000A), and carriage return (U+000D).
          .replace(regex, "");
        return toValidJson(json_str, attempt + 1);
      case RangeError:
        //  JavaScript engine runs out of memory
        console.error(
          "JSON.parse() ran out of memory while trying to parse the string.",
          err,
        );
        break;
      case TypeError:
        console.error(
          "JSON.parse() was called with arguments of the wrong type.",
          err,
        );
        break;
      default:
        console.error(err);
    }
  }
}
