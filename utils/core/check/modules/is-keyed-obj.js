export function isKeyedObject(value) {
  return (
    typeof value === "object" &&
    !Array.isArray(value) && // An Array is an Object with numeric keys
    typeof value !== "function" && // while functions are first-class objects, the `typeof` operator distinguishes them as "function"
    value !== null && // `null` and `Date()` are considered of object type. So, `typeof null` or `typeof Date()` would return "object".
    !(value instanceof Date)
  );
}
