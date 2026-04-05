import { isEmptyObj } from "./is-empty-obj.js";
import param_validator from "../../../../classes/modules/param-validator.js";

export function isDuplicateObj(obj, uniq_set, props) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateSet(uniq_set);
  param_validator.validateArray(props);

  let ini_size = uniq_set.size;
  // isolate ID properties into a new object that serves as a key for the Set()
  const curr_identifiers = props.reduce((acc, prop) => {
    if (obj[prop]) {
      acc[prop] = obj[prop];
    }
    return acc;
  }, {});

  // abort if `curr_identifiers` is empty
  if (isEmptyObj(curr_identifiers) || isEmptyObj(obj) || !props.length) {
    return false;
  }

  // check if a key exists in the Set() that shares at least one property with `curr_identifiers`
  // Set.has() can't perform a partial match on the properties of the key objects. It's based on SameValueZero algorithm, which is similar to strict equality (===).
  const existing_identifier = Array.from(uniq_set.keys()).find((key) =>
    props.some((prop) => key[prop] === curr_identifiers[prop]),
  );

  if (existing_identifier) {
    // merge eventual ID properties into `existing_identifier`
    Object.assign(
      existing_identifier,
      curr_identifiers,
    ); /* mutates `existing_identifier` in place ByRef. Object is the only mutable value in JavaScript,
          which means their properties can be changed without changing their reference in memory.
          Object.assign() static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
          For properties that share the same key, value in the target object is overwritten by the value in the last source.
          It returns the mutated target object */
  } else {
    uniq_set.add(curr_identifiers); // Set() stores a reference to `curr_identifiers`. So, if `curr_identifiers` is modified, the changes will be reflected in the Set()
  }
  return ini_size === uniq_set.size;
}

function isDuplicate(obj, uniq_objs_map, props) {
  // isolate ID properties into a new object that serves as a key for the Map()
  const curr_key = props.reduce((acc, prop) => {
    if (obj[prop]) {
      acc[prop] = obj[prop];
    }
    return acc;
  }, {});

  // abort if `curr_key` is empty
  if (isEmptyObj(curr_key)) {
    return;
  }

  // check if a key exists in the Map() that shares at least one property with `curr_key`
  // Map.has() can't perform a partial match on the properties of the key objects
  const existing_key = Array.from(uniq_objs_map.keys()).find((key) =>
    props.some((prop) => key[prop] === curr_key[prop]),
  );

  if (existing_key) {
    // merge eventual ID properties into `existing_key`
    Object.assign(
      existing_key,
      curr_key,
    ); /* mutates `existing_key` in place ByRef. Object is the only mutable value in JavaScript,
        which means their properties can be changed without changing their reference in memory.
        Object.assign() static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
        Properties in the target object are overwritten by properties in the sources if they have the same key.
        It returns the mutated target object */
    Object.assign(uniq_objs_map.get(existing_key), obj);
    return true;
  } else {
    uniq_objs_map.set(curr_key, obj); // Map() stores a reference to both, `curr_key` and `obj`. So, if `obj` is modified, the changes will be reflected in the Map()
    return false;
  }
}
