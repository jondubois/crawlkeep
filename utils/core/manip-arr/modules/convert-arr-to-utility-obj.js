/**
 * @description Converts Array into a utility object.
 * @param {Array} arr.
 * @returns {Object} - The utility object.
 */
export const convertArrToUtilityObj = (arr) => {
  const obj = {};
  obj.length = arr.length;
  obj.all = () => arr;
  obj.get = (index) => (index > arr.length - 1 ? undefined : arr[index]);
  obj.first = () => obj.get(0);
  obj.last = () => obj.get(arr.length - 1);
  return obj;
};
