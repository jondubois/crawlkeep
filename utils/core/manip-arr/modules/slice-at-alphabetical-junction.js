import { normaliseStr } from "../../manip-str/modules/normalise-str.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Slice an array at each junction where the first word character of the next element is alphabetically smaller than the previous one.
 * @param {string[]} texts - The array of texts, comprising of groups ordered alphabetically, to be sliced at each junction.
 * @returns {Array} - The array of arrays, each array containing a group alphabetically ordered. Non-mutating.
 * @todo - if all first characters of every element in the array are the same, then move the comparison to the second character, and so on.
 */
export function sliceAtAlphabeticalJunction(texts) {
  param_validator.validateArrayOfStringsIsNotEmpty(texts);

  return texts.reduce((acc, curr, i) => {
    const curr_first_letter = curr[0] ? normaliseStr(curr[0]) : undefined;
    const prev_first_letter = texts[i - 1]?.[0]
      ? normaliseStr(texts[i - 1]?.[0])
      : undefined;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#comparestring
    if (curr_first_letter === undefined || prev_first_letter === undefined) {
      if (acc.length === 0) {
        acc.push([curr]);
      } else {
        acc[acc.length - 1].push(curr);
      }
      return acc;
    }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#check_browser_support_for_extended_arguments
    curr_first_letter.localeCompare(prev_first_letter, undefined, {
      sensitivity: "base",
    }) >= 0
      ? acc[acc.length - 1].push(curr)
      : acc.push([curr]);
    return acc;
  }, []);
}

// const arr_catBodyData = ["a", "b", "y", "c", "d", "z", "e", "f"];
// sliceAtAlphabeticalJunction(arr_catBodyData);
// output
// [["a", "b", "y"], ["c", "d", "z"], ["e", "f"]]
