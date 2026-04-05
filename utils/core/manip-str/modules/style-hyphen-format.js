import param_validator from "../../../../classes/modules/param-validator.js";

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#using_an_inline_function_that_modifies_the_matched_characters
export function styleHyphenFormat(propertyName) {
  function upperToHyphenLower(match, offset, string) {
    return (offset > 0 ? "-" : "") + match.toLowerCase();
  }
  return propertyName.replace(/[A-Z]/g, upperToHyphenLower);
}

// URL components
const url_rx = new RegExp(
  "^(?<protocol>https?:\\/\\/)?" +
    "((?<subdomain>[a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*" +
    "(?<domain>[a-z\\d]([a-z\\d-]*[a-z\\d])*)" + // domain
    "\\.(?<tld>[a-z]{2,})" + // top-level domain (e.g .com, .org, .net, etc)
    "(\\:(?<port>\\d+))?" +
    "(?<path>\\/[-a-z\\d%_.~+]*)*" +
    "(\\?(?<query>[;&a-z\\d%_.~+=-]*))?" +
    "(\\#(?<fragment>[-a-z\\d_]*))?$",
  "i",
);
