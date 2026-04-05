import { typeOf } from "../../type-of.js";
import { isEmptyObj } from "../../check/index.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Adds the properties of `source` to `target` and,
 * in case a property already exists on `target`, skip the value in `source`
 * @param {Object} target - The target object to merge the properties into.
 * @param {Object} source - The source object containing the properties to merge.
 * @returns {Object} - The merged object.
 */
export function mergeSourceToTarget(target, source) {
  param_validator.validateKeyedObj(target);
  param_validator.validateKeyedObj(source);

  if (isEmptyObj(target)) {
    return source;
  }
  if (isEmptyObj(source)) {
    return target;
  }
  for (const key in source) {
    // if (Object.prototype.hasOwnProperty.call(source, key)) {  // plain objects. The `for...in` loop iterates over all enumerable properties,
    //   // including those inherited from the prototype chain.
    //   // `.hasOwnProperty` restricts it to only the object's own properties.
    //   // However, given that `source` is likely to be a plain object, the check was passed over.
    if (typeOf(source[key]) === "Object") {
      target[key] ??= {};
      mergeSourceToTarget(target[key], source[key]);
    } else {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      }
    }
    // }
  }
  return target;
}

// SOLUTION 1
/* function addPropertyOfSourceToAtarget(arr_source, arr_target) {
  arr_target.forEach((obj_target) => {
    const obj_source = arr_source.find((item) => item.name === obj_target.name);
    if (obj_source) {
      obj_target.parent = obj_source.parent;
    }
  });
  return arr_target;
} */

// // SOLUTION 2
// /**
//  * compare the two arrays and, if the name property of the json_taxoArr is found in the json_hierarArr, add the parent property to the json_taxoArr
//  * @param {Array} arr_source array of JSON objects, where each object has a name property and a parent property
//  * @param {Array} arr_target array of JSON objects to populate with the parent property
//  * @returns {Array} ByRef arr_target comprising of a parent property
//  */
// function addPropertyOfSourceToAtarget(arr_source, arr_target) {
//   const hierar_map = new Map(
//     arr_source.map(({ name, parent_name }) => [name, parent_name]),
//   );
//   // add the `parent_name` property
//   return arr_target.map((obj) => ({
//     ...obj,
//     parent_name: hierar_map.get(obj.name) ?? null, // || obj.parent_name,
//   }));
// }
// export { addPropertyOfSourceToAtarget };

/* // which is the equivalent of:
  function addPropertyOfSourceToAtarget(arr_source, arr_target) {
    const hierar_map = new Map(
      arr_source.map(({ name, parent }) => [name, parent])
    );
    return arr_target.map((obj_target) => {
      return {
        ...obj_target,
        parent: hierar_map.get(obj_target.name) || obj_target.parent,
      };
    });
  } */

/* const json_hierarArr = [
  {
    name: "sourcing1",
    parent: "talent_acquisition",
  },
  {
    name: "sourcing2",
    parent: "supply_chain",
  },
  {
    name: "logistics",
    parent: "supply_chain",
  },
];

const json_taxoArr = [
  {
    name: "sourcing1",
  },
  {
    name: "sourcing2",
  },
  {
    name: "logistics",
  },
];

const updatedTaxoArr = addPropertyOfSourceToAtarget(json_hierarArr, json_taxoArr);
console.log(updatedTaxoArr);*/
