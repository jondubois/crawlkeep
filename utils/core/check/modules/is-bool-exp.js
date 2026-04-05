import param_validator from "../../../../classes/modules/param-validator.js";

export function isBoolExpres(bool_exp) {
  param_validator.validateString(bool_exp);

  if (!bool_exp) {
    return false;
  }
  const bool_char_rx = new RegExp("^[\\s()!&|truefals]+$", "gim");
  return bool_char_rx.test(bool_exp);
}
