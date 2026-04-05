import param_validator from "../../../../classes/modules/param-validator.js";

export function findMaxIndexInArray(arr) {
  param_validator.validateArray(arr);

  const pattern = /\d+/;
  const regExp = new RegExp(pattern, "");
  // for reasons I can't explain, 'acc' and `regExp.exec(val)` are Arrays and should be spread using ... / rest operator
  // If the spread operator was to be used, it'd be creating a new array each time,
  // which is not necessary in this case and could lead to performance issues if the array is large.
  return arr.reduce((acc, val) => Math.max(acc, regExp.exec(val)), []);
}
