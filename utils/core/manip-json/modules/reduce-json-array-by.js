import { typeOf } from "../../type-of.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Within the array of JSON objects, merges objects that share at least one common identifier key.
 * The resulting array contains unique objects based on the provided identifier key.
 * @param {Array<Object>} json_arr - The array of JSON objects to be merged.
 * @param {string} id_key - The key used to identify and merge objects.
 * @returns {Array<Object>} - The merged array of JSON objects.
 *
 * @todo /!\ Not yet tested
 */
function mergeJsonArrayById(json_arr, id_key) {
  param_validator.validateArray(json_arr);
  param_validator.validateString(id_key);

  const unique_objs = new Map();

  json_arr.forEach((obj) => {
    if (typeOf(obj) !== "Object" || isEmptyObj(obj)) {
      return;
    }

    // isolate the ID property to serve as a key for the Map()
    const identifier = obj[id_key];

    if (!identifier) {
      return;
    }

    if (unique_objs.has(identifier)) {
      Object.assign(unique_objs.get(identifier), obj);
    } else {
      unique_objs.set(identifier, obj);
    }
  });

  return Array.from(unique_objs.values());
}

/**
 * @description Within the array of JSON objects, merges objects that share at least one common identifier key.
 * The rest of the identifier keys are then merged with source overwritting target.
 * The resulting array contains unique objects based on the provided identifier keys.
 * @param {Array<Object>} json_arr - The array of JSON objects to be merged.
 * @param {Array<string>} id_keys - The array of keys used to identify and merge objects against.
 * @returns {Array<Object>} - The merged array of JSON objects.
 *
 * @todo - depending of the order in `json_arr` of any duplicate IDs, one supersedes the other
 */
export function reduceJsonArrayBy(json_arr, id_keys) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateArrayOfStrings(id_keys);
  param_validator.warnArrOfEmptyStrings(id_keys);

  const unique_objs = new Map();

  json_arr.forEach((obj) => {
    if (typeOf(obj) !== "Object" || isEmptyObj(obj)) {
      return;
    }

    // isolate ID properties into a new object that serves as a key for the Map()
    const curr_identifier = id_keys.reduce((acc, key) => {
      if (obj[key]) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});

    if (isEmptyObj(curr_identifier) || !id_keys.length) {
      return;
    }

    /* check if a key exists in the Map() that shares at least one property with `curr_identifier`
    Map.has() can't perform a partial match on the properties of the key objects.
    It's based on SameValueZero algorithm, which is similar to strict equality (===). */
    const existing_identifier_reference = Array.from(unique_objs.keys()).find(
      (id_obj) =>
        id_keys
          .filter((k) => k in curr_identifier)
          .filter((k) => k in id_obj)
          .some((k) => id_obj?.[k] === curr_identifier?.[k]),
    ); /* Map uses the reference to that object in memory as the key. To later access the value associated with that key,
     the same object reference it to be used.*/

    if (existing_identifier_reference) {
      Object.assign(
        existing_identifier_reference,
        curr_identifier,
      ); /* mutates `existing_identifier` in place ByRef. Object is the only mutable value in JavaScript,
            which means their properties can be changed without changing their reference in memory.
            Object.assign() static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
            For properties that share the same key, value in the target object is overwritten by the value in the last source.
            It returns the mutated target object */
      Object.assign(unique_objs.get(existing_identifier_reference), obj);
    } else {
      unique_objs.set(
        curr_identifier,
        obj,
      ); /* Map() stores a reference to `curr_identifier`. So, if `curr_identifier` is modified, 
      then the changes will be reflected in the Map() */
    }
  });

  return Array.from(unique_objs.values());
}
// // usage:
// const json_arr = [
//   {
//     member_id: "123456789",
//     public_id: "jack-90a2bb134",
//   },
//   {
//     member_id: "550167130",
//     public_id: "denil-john-90a2bb134",
//     lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
//   },
//   {
//     member_id: "123456789",
//     public_id: "jack-90a2bb134",
//   },
//   {
//     member_id: "550167130",
//     public_id: "denil-john-90a2bb134",
//     lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
//   },
//   {
//     member_id: "987654321",
//     public_id: "kevin-smith-90a2bb134",
//   },
// ];
// const id_keys = ["public_id", "lir_niid", "member_id"];
// // // expected output:
// // const output = [
// //   {
// //     member_id: "123456789",
// //     public_id: "jack-90a2bb134",
// //   },
// //   {
// //     member_id: "550167130",
// //     public_id: "denil-john-90a2bb134",
// //     lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
// //   },
// //   {
// //     member_id: "987654321",
// //     public_id: "kevin-smith-90a2bb134",
// //   },
// // ];
// const output = reduceJsonArrayBy(json_arr, id_keys);
// debugger;
