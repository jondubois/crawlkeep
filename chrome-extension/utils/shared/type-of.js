import { ObjectChecker } from "./check/classes/object-checker.js";

export function typeOf(data) {
  // for primitive types, `typeof` is sufficient
  let data_type = typeof data;
  if (data_type !== "object") {
    return data_type;
  } else {
    /* even though `null` is of primitive type, due to a known quirk in JS `typeof null` returns "object".
    Check for `null` explicitly by using a strict equality comparison
    Because JavaScript is case-sensitive, `null` is not the same as `Null`, `NULL`, etc */
    if (data === null) {
      return "null";
    }
    return new ObjectChecker(data).getType1();
  }
}
