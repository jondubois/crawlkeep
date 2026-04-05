export function isArrOfEmptyStrings(arr) {
  return Array.isArray(arr) && arr.every((str) => str === "");
}
