import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Flattens a hierarchical object into a flat array of JSON objects.
 * @param {JSON} obj - The object to flatten showing hierarchical relation in a JSON format.
 * @param {string} child_entries_key - The key of the property that contains the hierarchical relation.
 * @returns {Array} - A flat array of JSON objects.
 */
export function flattenHierarchicalObj(obj, child_entries_key) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key][child_entries_key].length > 0) {
      acc.push(
        ...flattenHierarchicalObj(
          obj[key][child_entries_key],
          child_entries_key,
        ),
      );
    }
    acc.push(obj[key]);
    return acc;
  }, []);
}
