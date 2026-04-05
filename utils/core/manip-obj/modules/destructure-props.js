import { isEmptyObj } from "../../check/index.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Destructures properties from an object based on provided patterns.
 * @param {Object} obj - The object to destructure properties from.
 * @param {Array<string>} patterns - An array of patterns to match property names against.
 * @returns {Array<Object>} - An array of objects containing the destructure properties.
 */

export function destructureProps(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);
  param_validator.warnArrOfEmptyStrings(patterns);

  if (isEmptyObj(arguments[0])) {
    return arguments[0];
  }

  if (!arguments[1].length) {
    return arguments[0];
  }

  let category_name, index, property_name, match;
  const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));

  return Object.entries(obj).reduce((acc, [key, val]) => {
    for (const rx of regexes) {
      if ((match = rx.exec(key)) !== null) {
        ({ category_name, index, property_name } = match.groups);
        acc.push({
          category_name,
          ...(index && { index }),
          property_name,
          val,
        });
        break;
      }
    }
    return acc;
  }, []);
}
