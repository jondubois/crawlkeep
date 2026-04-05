import param_validator from "../../../../classes/modules/param-validator.js";

// SOLUTION 1
/**
 * @description in an object, check for duplicates of a property name.
 * Returns only the items that have duplicates based on the specified property
 * @param {Object[]} json_arr - The array to check duplicates for
 * @param {string} key - The key of the property to check for duplicates
 * @returns {Object[]} - The array of duplicates
 */
export function filterDuplicateProps(json_arr, key) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);

  if (!json_arr.length || key === "") {
    return [];
  }

  return json_arr.filter((obj, index) => {
    return json_arr.some(
      (element, i) => i !== index && element[key] === obj[key],
    );
  });
}

/* const json_arr = [
  {
    name: "sourcing",
    parent: "talent_acquisition",
  },
  {
    name: "sourcing",
    parent: "supply_chain",
  },
  {
    name: "logistics",
    parent: "supply_chain",
  },
];
const duplicates = filterDuplicates(json_arr, "parent");
*/

/**
 * Returns all the duplicate items based on the specified property, but only includes the duplicates (not the first occurrence).
 * @param {Object[]} json_arr - The array to check duplicates for.
 * @param {string} key - The key of the property to check for duplicates.
 * @returns {Object[]} - The array of duplicates.
 */
export function filterDuplicateProps1(json_arr, key) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);

  if (!json_arr.length || key === "") {
    return [];
  }

  const seen = new Set();
  const duplicates = [];

  for (const obj of json_arr) {
    if (seen.has(obj[key])) {
      duplicates.push(obj);
    } else {
      seen.add(obj[key]);
    }
  }

  return duplicates;
}

/* // SOLUTION 2
  const parentMap = new Map();
  const duplicates = json_arr.filter((item) => {
    return parentMap.has(item.parent)
      ? true
      : () => {
          parentMap.set(item.parent, true);
          return false;
        };
  }); */

// SOLUTION 3
/* const duplicates = json_arr.filter((item, index) => {
    return json_arr.findIndex((element, i) => {
      return i !== index && element.parent === item.parent;
    }) !== -1;
  }); */
