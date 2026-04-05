import param_validator from "../../../../classes/modules/param-validator.js";

// for naming classes, interfaces, and types
export function toPascalCase(str) {
  param_validator.validateString(str);

  if (!str) {
    return str;
  }
  return str
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\B\w/g, (letter) => letter.toLowerCase());
}

// for naming functions and methods
export const toCamelCase = (str) =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, i) =>
      i === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, "");

// for naming variables, properties; and with databases, table and column
export const toSnakeCase = (str) => str.replace(/\s+/g, "_").toLowerCase();

// for naming urls, files, html classes
export const toKebabCase = (str) => str.replace(/\s+/g, "-").toLowerCase();
