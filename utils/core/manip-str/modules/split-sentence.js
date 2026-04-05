import param_validator from "../../../../classes/modules/param-validator.js";

// sentence splitter
export function stringSplit(str) {
  param_validator.validateString(str);

  return str.split(/(?<=[.?!])\s+/);
}
export function getSentences(str) {
  param_validator.validateString(str);

  return str.matchAll(/.+?(?=[.!?])/g); // implicitly converted to a RegExp by using `new RegExp(regexp, 'g')`
}

export function getFirstSubsentence(str) {
  param_validator.validateString(str);

  return /^.*?(?=[,.])/g.exec(str)?.[0]; // Inside a character set (the square brackets []), the dot . loses its special meaning and is treated as a literal dot. So, it does not need to be escaped
}

// function getSubSentences(str) {
//   return str.matchAll(/[^.!?,;]+[.!?,;]+/g);  // , ; :
// }
// export { getSubSentences };
