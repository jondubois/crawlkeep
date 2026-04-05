// import { isEmptyArr, isEmptyObj, isJsonArray } from "../../check/index.js";
import { isEmptyArr } from "../../check/modules/is-empty-arr.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import { intersection } from "../../manip-arr/modules/superpose-arr.js";
import { reduceJsonArrayBy } from "../../manip-json/modules/reduce-json-array-by.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Merges one array of objects into the other, based on a common key.
 * Only includes elements from the target array. Only the values of their common key can serve as a basis for matching.
 * Merges (adds + overwrites values in target) the properties of matching elements in the source array.
 * Elements from the source array whose common key doesn't match with the value of the common key in the target array are discarded.
 * @param {Array<Object>} target - The array of keyed objects to overwrite.
 * @param {Array<Object>} source - The array of objects to merge.
 * @param {string} common_key - The common key between the objects in both arrays.
 * @returns {Array<Object>} - An array of merged objects.
 * @example
 * const target = [{ id: 1, name: "Node1" }, { id: 2, name: "Node2" }];
 * const source = [{ id: 1, description: "Description1" }, { id: 3, description: "Description3" }];
 * const output = mergeTargetWithSourceBy(target, source, "id");
 * expected output: [{ id: 1, name: "Node1", description: "Description1" }, { id: 2, name: "Node2" }]
 */
export function mergeTargetWithSourceBy(target, source, common_key) {
  param_validator.validateJsonArr(arguments[0]);
  param_validator.validateJsonArr(arguments[1]);
  param_validator.validateString(arguments[2]);

  let check;
  if ((check = isEmptyArr(arguments[0]) || isEmptyArr(arguments[1]))) {
    check
      ? arguments[1]
      : arguments[0]; /* if both are empty arrays, it won't check for `isEmptyArr(source)` due to short-circuiting (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence#short-circuiting);
      still, returns `target`, which is an empty array */
  }
  if (!arguments[2]) {
    return {};
  }
  return target.map((target_node) => {
    const matching_node = source.find(
      (source_node) => source_node[common_key] === target_node[common_key],
    );
    return matching_node ? { ...target_node, ...matching_node } : target_node;
  });
} /* `Array.prototype.map()` and `Array.prototype.find()`, result in a time complexity of O(n * m),
where n is the length of `target` and m is the length of `source`. */

/**
 * @description Merges two flat (non-nested) keyed objects whose values may contain Arrays.
 * For common properties, shared between the two Objects,
 * if their value is an Array, then:
 * - de-duplicate keyed Objects in Array of keyed Objects
 * - retains the value of the source.
 * @requires typeOf, isEmptyObj, intersection, deDupArr
 * @param {Object} target - The first flat object with eventual values of type Array.
 * @param {Object} source - The second flat object with eventual values of type Array.
 * @param {Array<string>} identifier_keys - The keys used to identify and merge objects against.
 * @returns {Object} - The merged object with de-duplicated Array values.
 * @todo /!\ Didn't test
 */
function mergeSourceToTargetById(target, source, identifier_keys) {
  param_validator.validateKeyedObj(target);
  param_validator.validateKeyedObj(source);
  param_validator.validateArrayOfStrings(identifier_keys);

  let check;
  if ((check = isEmptyObj(target)) || isEmptyObj(source)) {
    return check ? source : target;
  }
  if (!identifier_keys.length) {
    return Object.assign(target, source);
  }
  const acc = {};
  const target_copy = { ...target };
  const source_copy = { ...source };
  const common_keys = intersection(
    Object.keys(target_copy),
    Object.keys(source_copy),
  );
  // merge common properties that are arrays
  for (const key of common_keys) {
    const t_val = target_copy[key];
    const s_val = source_copy[key];
    if (
      !Array.isArray(t_val) ||
      !isJsonArray(t_val) ||
      !Array.isArray(s_val) ||
      !isJsonArray(s_val)
    )
      continue;
    acc[key] = reduceJsonArrayBy([...t_val, ...s_val], identifier_keys);
    delete target_copy[key];
    delete source_copy[key];
  }
  // Merge non-common properties
  Object.assign(acc, target_copy, source_copy);
  return acc;
}

// /**
//  * Merges two objects based on a common key.
//  * Includes properties from both, `obj1` and `obj2`, ensuring all unique keys are represented in the result.
//  * In case objects share common properties, the values from `obj2` will overwrite the values from `obj1`.
//  *
//  * @param {Object} obj1 - The first object to merge.
//  * @param {Object} obj2 - The second object to merge.
//  * @param {string} common_key - The common key used for merging.
//  * @returns {Array} - An array of merged objects.
//  *
//  * @example
//  * const c = { name: "name1", parent_name: "parent name1" };
//  * const d = { name: "name1", property: "property1" };
//  * mergeObjectsBy(c, d, "name");
//  * // Expected result:
//  * // [
//  * //   {
//  * //     name: "name1",
//  * //     parent_name: "parent name1",
//  * //     property: "property1"
//  * //   }
//  * // ]
//  */
// function mergeObjectsBy(obj1, obj2, common_key) {
//   if (
//     typeOf(arguments[0]) !== "Object" ||
//     typeOf(arguments[1]) !== "Object" ||
//     typeof arguments[2] !== "string"
//   ) {
//     throw new TypeError(
//       `${mergeObjectsBy.name} - Invalid input. Expected:
//       - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[0],
//       )}
//       - ${arguments[1]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[1],
//       )}
//       - ${
//         arguments[2]
//       } to be a String. Instead, was passed ${typeof arguments[2]}`,
//     );
//   }
//   if (isEmptyObj(arguments[0]) || isEmptyObj(arguments[1]) || !arguments[2]) {
//     return {};
//   }
//   ({ [common_key]: common_key } = obj1); // destructuring + computed property name
//   // the value serves as a unique key for the Map
//   const map1 = new Map([[common_key, obj1]]); // The Map constructor takes an iterable (like an array) of key-value pairs. Each key-value pair should also be an iterable (like an array) where the first element is the key and the second element is the value
//   const map2 = new Map([[common_key, obj2]]);
//   const uniq_shared_keys = new Set([common_key]);
//   // the unique key becomes a pivot in merging corresponding values in each object
//   return [...uniq_shared_keys].map((key) => ({
//     ...map1.get(key),
//     ...map2.get(key),
//   }));
// }

// export function mergeObjsBy(node1, node2) {
//   if (typeOf(node1) !== "Object" || typeOf(node2) !== "Object") {
//     throw new TypeError(
//       `${mergeObjsBy.name} - Invalid input. Expected:
//         - ${node1} to be a keyed Object. Instead, was passed ${typeOf(node1)}
//         - ${node2} to be a keyed Object. Instead, was passed ${typeOf(node2)}`,
//     );
//   }

//   let check;
//   if ((check = isEmptyObj(node1)) || isEmptyObj(node2)) {
//     return check ? node2 : node1;
//   }

//   const acc = {};
//   const node1_copy = { ...node1 };
//   const node2_copy = { ...node2 };

//   const common_keys = intersection(
//     Object.keys(node1_copy),
//     Object.keys(node2_copy),
//   );

//   // merge common properties that are arrays
//   for (const key of common_keys) {
//     const node1_val = node1_copy[key];
//     const node2_val = node2_copy[key];

//     if (typeof node1_val === "object" || typeof node2_val === "object") {
//       if (Array.isArray(node1_val) || Array.isArray(node2_val)) {
//         // TODO - edge case: if the arrays contain keyed Objects, how to merge them? Maybe by a common key
//         const uniq_arr = deDupArr([...node1_val, ...node2_val]);

//         if (isJsonArray(uniq_arr)) {
//           // check if array contains employees identifiers
//           const is_employee_arr = uniq_arr.every((obj) => {
//             person_id_keys.some((key) => key in obj);
//           });
//           if (is_employee_arr) {
//             acc[key] = reduceJsonArrayBy(uniq_arr);
//           }
//           acc[key] = uniq_arr.map((obj) => {
//             mergeObjsBy;
//           });
//         }
//         delete node1_copy[key];
//         delete node2_copy[key];
//       } else if (
//         typeOf(node1_val) === "Object" ||
//         typeOf(node2_val) === "Object"
//       ) {
//         if (isCascading(node1_val) || isCascading(node2_val)) {
//           // merge by depth of nesting
//           const [node1_depth, node2_depth] = [node1_copy, node2_copy].map(
//             (obj) => {
//               tree_parser.setStateTo(obj[key]);
//               return tree_parser.getTreeHeight();
//             },
//           );
//           // if of equal depth, then merge `node2_val` into `node1_val`
//           if (node1_depth > node2_depth) {
//             acc[key] = node1_val;
//           } else {
//             acc[key] = node2_val;
//           }
//           delete node1_copy[key];
//           delete node2_copy[key];
//         }
//       }
//     }
//   }

//   // Merge non-common properties
//   Object.assign(acc, node1_copy, node2_copy);
//   return acc;
// }

// /**
//  * Merges two flat (non-nested) keyed objects whose values may contain Arrays.
//  * For common properties, shared between the two Objects,
//  * if their value is an Array, then retains the de-duplicated merged Array.
//  * /!\ Doesn't merge keyed Objects in Array of keyed Objects; only deDupArr()
//  * /!\ Not tested
//  *
//  * @requires typeOf, isEmptyObj, intersection, deDupArr
//  * @param {Object} obj1 - The first flat object with eventual values of type Array.
//  * @param {Object} obj2 - The second flat object with eventual values of type Array.
//  * @returns {Object} - The merged object with de-duplicated Array values.
//  */
// export function mergeObjsByTopLvlValIsArr(obj1, obj2) {
//   if (typeOf(obj1) !== "Object" || typeOf(obj2) !== "Object") {
//     throw new TypeError(
//       `${mergeObjsByTopLvlValIsArr.name} - Invalid input. Expected:
//         - ${obj1} to be a keyed Object. Instead, was passed ${typeOf(obj1)}
//         - ${obj2} to be a keyed Object. Instead, was passed ${typeOf(obj2)}`,
//     );
//   }

//   let check;
//   if ((check = isEmptyObj(obj1)) || isEmptyObj(obj2)) {
//     return check ? obj2 : obj1;
//   }

//   const acc = {};

//   const getArrayEntries = (obj) =>
//     Object.fromEntries(
//       Object.entries(obj).filter(([_, val]) => Array.isArray(val)),
//     );

//   // in a shallow copy, separate the properties that have an Array as a value
//   const val_is_arr_obj1 = getArrayEntries(obj1);
//   const val_is_arr_obj2 = getArrayEntries(obj2);

//   const common_keys = intersection(
//     Object.keys(val_is_arr_obj1),
//     Object.keys(val_is_arr_obj2),
//   );

//   const all_arr_keys = union(
//     Object.keys(val_is_arr_obj1),
//     Object.keys(val_is_arr_obj2),
//   );

//   // merge common properties that are arrays
//   for (const key of all_arr_keys) {
//     acc[key] = common_keys.includes(key)
//       ? union(val_is_arr_obj1[key] || [], val_is_arr_obj2[key] || [])
//       : val_is_arr_obj1[key] ?? val_is_arr_obj2[key];
//     delete val_is_arr_obj1[key];
//     delete val_is_arr_obj2[key];
//   }

//   // Merge non-common properties
//   Object.assign(acc, val_is_arr_obj1, val_is_arr_obj2);
//   return acc;
// }
