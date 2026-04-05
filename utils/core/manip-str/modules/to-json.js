import param_validator from "../../../../classes/modules/param-validator.js";

export function toJson(str) {
  param_validator.validateString(str);

  try {
    return JSON.parse(str);
  } catch (error) {
    console.error(
      `Whilst processing toJson() - Unable to parse string ${str} as JSON. Error:`,
      error,
    );
    return null;
  }
}
