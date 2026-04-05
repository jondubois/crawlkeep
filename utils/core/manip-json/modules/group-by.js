import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Groups an array of objects by a specified property key, using a callback function.
 * @param {Object[]} json_arr - The array of objects to be grouped.
 * @param {Function} keyGetterCallback - The callback function that returns the key for grouping.
 * @returns {Object} - An object where the keys are the grouped values and the values are arrays of objects with the same key.
 */
export function groupBy(json_arr, keyGetterCallback) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateFunction(keyGetterCallback);

  return json_arr.reduce((acc, curr) => {
    const key = keyGetterCallback(curr);
    acc[key] = (acc[key] || []).concat(curr);
    return acc;
  }, {}); // if `json_arr` is empty, then the initial value of the accumulator `{}` is returned as is
}

/**
 * @description Groups an array of objects by a specified property key.
 * @param {Object[]} json_arr - The array of objects to be grouped.
 * @param {string} key - The property key for grouping.
 * @returns {Object} - An object where the keys are the grouped values and the values are arrays of objects with the same key.
 */
export function groupByProp(json_arr, key) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);

  return json_arr.reduce((acc, curr) => {
    const keyValue = curr[key];
    acc[keyValue] = (acc[keyValue] || []).concat(curr);
    return acc;
  }, {}); // if `json_arr` is empty, then the initial value of the accumulator `{}` is returned as is
}

/**
 * @description Groups an array of objects by one of their properties, discarding the specified property in the resulting grouped objects.
 * By default, sorts by `prop_name` parameter.
 * @param {Array} json_arr - The array of keyed objects to be grouped.
 * @param {string} prop_name - The property to group the objects by.
 * @returns {Array} - The grouped array of objects.
 */
export function groupPropsByDiscard(json_arr, prop_name) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(prop_name);

  if (!prop_name) return json_arr; // `!isEmptyArr(json_arr)` was checked above

  return Object.values(
    json_arr.reduce((acc, curr) => {
      if (curr[prop_name]) {
        let { [prop_name]: key, ...rest } = curr; // computed property destructuring
        acc[key] = { ...acc[key], ...rest };
      }
      return acc;
    }, {}),
  );
}

// /**
//  * DOESN'T WORK
//  * Groups an array of objects by one of their properties.
//  * @param {Array} arr - The array of objects to be grouped.
//  * @param {string} prop - The property to group the objects by.
//  * @returns {Array} - The grouped array of objects.
//  */
// function groupPropsBy(arr, prop) {
//   if (!Array.isArray(arr) || typeof prop !== "string") {
//     return arr;
//   } else {
//     return Object.values(
//       arr.reduce((acc, curr) => {
//         acc[curr[prop]] = { ...acc[curr[prop]], ...curr };
//         return acc;
//       }, {}),
//     );
//   }
// }
// export { groupPropsBy };

// // Solution 1
// function groupPropsByIndex1(arr) {
//   const result = new Map();
//   arr.forEach((curr) => {
//     const index = curr.index;
//     if (!result.has(index)) {
//       result.set(index, {});
//     }
//     Object.entries(curr).forEach(
//       ([key, value]) => (result.get(index)[key] = value),
//     );
//   });
//   return Array.from(result.values());
// }

// // solution 3
// function groupPropsByIndex3(arr) {
//   return Object.values(
//     arr.reduce((result, curr) => {
//       const index = curr.index;
//       if (!result[index]) {
//         result[index] = {};
//       }
//       Object.entries(curr).forEach(([key, value]) => {
//         result[index][key] = value;
//       });
//       return result;
//     }, {}),
//   );
// }

// // Solution 4  **discards pivot property**
// function groupPropsByIndex4(arr) {
//   return Array.from(
//     arr
//       .reduce((result, curr) => {
//         const { index, ...rest } = curr;
//         result.set(index, { ...result.get(index), ...rest });
//         return result;
//       }, new Map())
//       .values(),
//   );
// }

// // Solution 5
// function groupPropsByIndex5(arr) {
//   return Object.values(
//     arr.reduce((acc, curr) => {
//       const index = curr.index;
//       acc[index] = { ...acc[index], ...curr };
//       return acc;
//     }, {}),
//   );
// }
