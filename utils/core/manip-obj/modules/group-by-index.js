import { groupPropsByDiscard } from "../../../core/manip-json/modules/group-by.js";
import { isEmptyObj } from "../../../core/check/modules/is-empty-obj.js";
import { isEmptyArr } from "../../../core/check/modules/is-empty-arr.js";
import { isKeyedObject } from "../../../core/check/modules/is-keyed-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @param {Object} obj - The flat object to be converted.
 * @param {Array} patterns - An array of RegExp patterns used for conversion.
 * @returns {Object} - The grouped object.
 */
export function groupByIndex(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);

  if (isEmptyObj(obj) || isEmptyArr(patterns)) {
    return obj;
  }

  const obj_copy = { ...obj };

  // only pass to `groupByIndexHelper` properties whose value is a primitive
  const buffer = Object.entries(obj).reduce((acc, [key, val]) => {
    if (!isEmptyArr(val) && val.every((item) => isKeyedObject(item))) {
      // recurse on values that are an Array of keyed Objects
      acc[key] = val.map((o) => groupByIndex(o, patterns));
      delete obj_copy[key];
    }
    return acc;
  }, {});

  return {
    ...buffer,
    ...groupByIndexHelper(obj_copy, patterns),
  };
}

/**
 * @description Identify a category name based on user-defined RegExp patterns.
 * Nest the properties under the category name.
 * @param {object} obj - The object whose properties are to be standardized.
 * @param {Array} patterns - An array of patterns used for standardization.
 * @returns {object} - The object with standardized properties.
 * @todo - instead of an Array of RegExp patterns, accept a single pattern
 * /////////////////  NOT TESTED  //////////////////
 */
function groupByIndexHelper(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);
  // TODO - instead of an Array of RegExp patterns, accept a single pattern

  if (isEmptyObj(obj) || isEmptyArr(patterns)) {
    return obj;
  }
  const obj_copy = { ...obj };

  // for properties that can be grouped, desctructure..
  // TODO - dynamically rename a property key during destructuring. const index = "index";
  let category_name, index, property_name, match; // since `index` belongs to the outer scope it can be called further down
  const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));
  const destructured_props = Object.entries(obj).reduce((acc, [key, val]) => {
    for (const rx of regexes) {
      if ((match = rx.exec(key)) !== null) {
        delete obj_copy[key];
        ({ category_name, index, property_name } = match.groups);
        acc.push({
          ...(index && { index }),
          ...(category_name && { category_name }),
          ...(property_name && { property_name }),
          ...(val && { val }),
        });
        break;
      }
    }
    return acc;
  }, []);

  // abort if no match
  if (!destructured_props.length) {
    return obj;
  }
  // ..then group by index.
  return Object.entries(destructured_props).reduce((acc, [key, val]) => {
    if (index && !isEmptyArr(val)) {
      // TODO - verify that it doesn't throw any exceptions
      acc[key] = groupPropsByDiscard(val, "index");
    } else {
      acc[key] = val.reduce((a, o) => ({ ...a, ...o }), {});
    }
    return acc;
  }, {});
  // I think it doesn't work
  //   let standardised_obj =
  //     index && !isEmptyArr(val)
  //       ? groupPropsByDiscard(destructured_props, "index")
  //       : destructured_props.reduce((a, o) => ({ ...a, ...o }), {});
  //   return { ...standardised_obj, ...obj_copy };
}
