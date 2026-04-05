import param_validator from "./param-validator.js";

/**
 * @method extractFromObjBy
 */
export class FlatObjectParser {
  constructor() {
    this.flat_obj = {};
  }

  setStateTo = (flat_obj) => {
    param_validator.validateKeyedObj(flat_obj);
    this.flat_obj = flat_obj;
  };

  /**
   * @description Extracts properties from a flat object based on the provided target keys.
   *
   * @param {string[]} target_keys - An array of keys to extract or exclude from the flat object.
   * @param {boolean} [is_excluded=false] - If true, the properties in target_keys will be excluded; otherwise, they will be included.
   * @return {Object} A new keyed Object with the extracted or excluded properties.
   */
  extractFromObjBy = (target_keys, is_excluded = false) => {
    param_validator.validateArrayOfStrings(target_keys);
    // param_validator.warnArrOfEmptyStrings(target_keys);

    if (!target_keys.filter(Boolean).length) {
      return this.flat_obj;
    }

    const deep_clone = structuredClone(this.flat_obj);

    Object.keys(deep_clone).forEach((key) => {
      if (
        (is_excluded && target_keys.includes(key)) ||
        (!is_excluded && !target_keys.includes(key))
      ) {
        delete deep_clone[key];
      }
    });
    return deep_clone;
  };
}

// equivalent to:
// if (is_excluded) {
//   // Keep every property except the ones in target_keys
//   target_keys.forEach((key) => {
//     delete deep_clone[key];
//   });
// } else {
//   // Keep only the properties whose keys are in target_keys
//   Object.keys(deep_clone).forEach((key) => {
//     if (!target_keys.includes(key)) {
//       delete deep_clone[key];
//     }
//   });
// }
