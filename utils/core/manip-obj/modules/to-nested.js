import { groupPropsByDiscard } from "../../manip-json/index.js";
// import {isEmptyArr, isEmptyObj, isJsonArray} from "../../check/index.js";
import { isEmptyArr } from "../../check/modules/is-empty-arr.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import { typeOf } from "../../type-of.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts a flat object into a nested object, based on user-defined RegExp patterns.
 * @param {Object} obj - The flat object to be converted.
 * @param {Array} patterns - An array of RegExp patterns used for conversion.
 * @returns {Object} - The nested object.
 */
export function toNested5(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);
  param_validator.warnArrOfEmptyStrings(patterns);

  if (isEmptyObj(obj) || isEmptyArr(patterns)) {
    return obj;
  }
  // create a deep clone of `obj`
  const clone = structuredClone(obj);

  // only pass to `toNestedHelper` properties whose value is a primitive
  const buffer = Object.entries(obj).reduce((acc, [key, val]) => {
    if (typeof val === "object") {
      // TODO - doesn't account for other Objects, like RegExp, Classes, Built-in Objects, etc.
      if (Array.isArray(val) && isJsonArray(val)) {
        acc[key] = val.map((o) => toNested5(o, patterns));
      } else if (typeOf(val) === "Object") {
        acc[key] = toNestedHelper(val, patterns);
      }
      delete clone[key];
    }
    return acc;
  }, {});

  return {
    ...buffer,
    ...toNestedHelper(clone, patterns),
  };
}

/**
 * @description Converts a flat object into a nested object, based on user-defined RegExp patterns.
 * @param {Object} obj - The flat object to be converted.
 * @param {Array} patterns - An array of RegExp patterns used for conversion.
 * @returns {Object} - New nested object.
 */
export function toNestedHelper(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);
  param_validator.warnArrOfEmptyStrings(patterns);

  if (isEmptyObj(obj) || isEmptyArr(patterns)) {
    return obj;
  }
  // create a deep clone of `obj`
  const clone = structuredClone(obj);

  // for top-level properties that can be serialized, destructure..
  // TODO - dynamically rename a property key during destructuring. const index = "index";
  let category_name, index, property_name, match; // since `index` belongs to the outter scope it can be called further down
  const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));
  const destructured_props = Object.entries(obj).reduce((acc, [key, val]) => {
    for (const rx of regexes) {
      if ((match = rx.exec(key)) !== null) {
        delete clone[key];
        ({ category_name, index, property_name } = match.groups);
        acc.push({
          ...(category_name && { category_name }),
          ...(index && { index }),
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

  // ..then, serialise destructured properties and nest under `category_name`,
  let categorised_normalized_props = destructured_props.reduce(
    (acc, { category_name, index, property_name, val }) => {
      if (!property_name || !val) return acc;
      // category_name = toPluralNoun(category_name);
      if (category_name) {
        acc[category_name] = (acc[category_name] || []).concat({
          ...(index && { index }),
          [`${property_name}`]: val,
        }); // ${category_name}_
      } else {
        acc[property_name] = val;
      }
      return acc;
    },
    {},
  );

  // ..finally, group by index.
  let nested_obj = Object.entries(categorised_normalized_props).reduce(
    (acc, [key, val]) => {
      if (!key || !val) return acc;
      if (Array.isArray(val) && isJsonArray(val)) {
        if (index) {
          // TODO - verify that it doesn't throw any exceptions
          acc[key] = groupPropsByDiscard(val, "index");
        } else {
          acc[key] = val.reduce((a, o) => ({ ...a, ...o }), {});
        }
      } else {
        acc[key] = val;
      }
      return acc;
    },
    {},
  );

  return { ...nested_obj, ...clone };
}

/**
 * @description Converts a flat object into a nested object, based on user-defined RegExp patterns.
 * @param {Object} obj - The flat object to be converted.
 * @param {Array} patterns - An array of RegExp patterns used for conversion.
 * @returns {Object} - New nested object.
 */
export function toSerialised(obj, patterns) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(patterns);
  param_validator.warnArrOfEmptyStrings(patterns);

  if (isEmptyObj(obj) || isEmptyArr(patterns)) {
    return obj;
  }
  // create a deep clone of `obj`
  const clone = structuredClone(obj);

  // for top-level properties that can be serialized, destructure..
  let category_name, index, property_name, match; // since `index` belongs to the outter scope it can be called further down
  const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));
  const destructured_props = Object.entries(obj).reduce((acc, [key, val]) => {
    for (const rx of regexes) {
      if ((match = rx.exec(key)) !== null) {
        delete clone[key];
        ({ category_name, index, property_name } = match.groups);
        acc.push({
          ...(category_name && { category_name }),
          ...(index && { index }),
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

  // ..then, serialise destructured properties by removing `category_name`,
  let normalized_props = destructured_props.reduce(
    (acc, { category_name, index, property_name, val }) => {
      if (!property_name || !val) return acc;
      // remove `category_name` from the key
      if (category_name) {
        acc[property_name] = (acc[property_name] || []).concat({
          ...(index && { index }),
          [`${property_name}`]: val,
        });
      } else {
        acc[property_name] = val;
      }
      return acc;
    },
    {},
  );
  return { ...normalized_props, ...clone };
}

// TODO - test and verify that the following functions work as expected
// /**
//  * Extracts and destructures properties that match given regex patterns
//  * @param {Object} obj - The object to destructure
//  * @param {Array} patterns - Array of regex patterns with named capture groups
//  * @returns {Object} - Object containing destructured_props (Array) and rest (Object)
//  */
// export function destructureProps(obj, patterns) {
//   if (typeOf(arguments[0]) !== "Object" || !Array.isArray(arguments[1])) {
//     throw new TypeError(
//       `${destructureProps.name} - Invalid input. Expected:
//       - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[0],
//       )}
//       - ${arguments[1]} to be an Array. Instead, was passed ${typeOf(
//         arguments[1],
//       )}`,
//     );
//   }
//   if (check.isEmptyObj(obj) || check.isEmptyArr(patterns)) {
//     return [];
//   }

//   // create a deep clone of `obj`
//   const clone = structuredClone(obj);
//   let category_name, index, property_name, match;
//   const regexes = patterns.map((pattern) => new RegExp(pattern, "i"));

//   const destructured_props = Object.entries(obj).reduce((acc, [key, val]) => {
//     for (const rx of regexes) {
//       if ((match = rx.exec(key)) !== null) {
//         delete clone[key];
//         ({ category_name, index, property_name } = match.groups);
//         acc.push({
//           ...(category_name && { category_name }),
//           ...(index && { index }),
//           ...(property_name && { property_name }),
//           ...(val && { val }),
//         });
//         break;
//       }
//     }
//     return acc;
//   }, []);

//   return { destructured_props, rest: clone };
// }

// /**
//  * Serialise destructured properties and nest under `category_name`
//  * @param {Array} destructured_props - Array of destructured properties
//  * @returns {Object} - Properties organized by category
//  */
// export function categorizeProps(destructured_props) {
//   if (!Array.isArray(destructured_props)) {
//     throw new TypeError(
//       `${
//         categorizeProps.name
//       } - Invalid input. Expected an Array, received ${typeOf(
//         destructured_props,
//       )}`,
//     );
//   }

//   if (destructured_props.length === 0) {
//     return {};
//   }

//   return destructured_props.reduce(
//     (acc, { category_name, index, property_name, val }) => {
//       if (!property_name || !val) return acc;

//       if (category_name) {
//         acc[category_name] = (acc[category_name] || []).concat({
//           ...(index && { index }),
//           [`${property_name}`]: val,
//         });
//       } else {
//         acc[property_name] = val;
//       }
//       return acc;
//     },
//     {},
//   );
// }

// /**
//  * group properties by index
//  * @param {Object} categorized_props - Categorized properties object
//  * @param {boolean} hasIndex - Whether the properties have an index field
//  * @returns {Object} - The final nested object
//  */
// export function groupPropsByIndex(categorized_props, hasIndex) {
//   if (typeOf(categorized_props) !== "Object") {
//     throw new TypeError(
//       `${
//         groupPropsByIndex.name
//       } - Invalid input. Expected an Object, received ${typeOf(
//         categorized_props,
//       )}`,
//     );
//   }

//   if (check.isEmptyObj(categorized_props)) {
//     return {};
//   }

//   return Object.entries(categorized_props).reduce((acc, [key, val]) => {
//     if (!key || !val) return acc;

//     if (Array.isArray(val) && check.isJsonArray(val)) {
//       if (hasIndex) {
//         acc[key] = groupPropsByDiscard(val, "index");
//       } else {
//         acc[key] = val.reduce((a, o) => ({ ...a, ...o }), {});
//       }
//     } else {
//       acc[key] = val;
//     }
//     return acc;
//   }, {});
// }

// export function toNestedHelper(obj, patterns) {
//   if (typeOf(arguments[0]) !== "Object" || !Array.isArray(arguments[1])) {
//     throw new TypeError(
//       `${toNestedHelper.name} - Invalid input. Expected:
//       - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[0],
//       )}
//       - ${arguments[1]} to be an Array. Instead, was passed ${typeOf(
//         arguments[1],
//       )}`,
//     );
//   }

//   if (check.isEmptyObj(obj) || check.isEmptyArr(patterns)) {
//     return obj;
//   }

//   const { destructured_props, rest } = destructureProps(obj, patterns);

//   // abort if no match
//   if (!destructured_props.length) {
//     return obj;
//   }

//   // check if any of the destructured properties has an index
//   const hasIndex = destructured_props.some((prop) => "index" in prop);

//   const categorized_props = categorizeProps(destructured_props);
//   const nested_props = groupPropsByIndex(categorized_props, hasIndex);

//   return { ...nested_props, ...rest };
// }
