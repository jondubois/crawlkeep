import { isEmptyArr } from "../../check/modules/is-empty-arr.js";
import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Filters an array of sentences based on a regular expression and keeps a specified number of surrounding sentences.
 * @param {string[]} sentences - The array of sentences to filter.
 * @param {RegExp} regex - The regular expression used to filter the sentences.
 * @param {number} num - The number of surrounding sentences to keep.
 * @returns {string[]} - The filtered array of sentences with the specified number of surrounding sentences.
 * @throws {Error} - If the sentences array is empty, regex is not a RegExp, or num is not a non-negative number.
 *
 * @todo - make it for a string as parameter
 */
export function keepSurroundingSentences(sentences, regex, num) {
  param_validator.validateArrayOfStringsIsNotEmpty(sentences);
  param_validator.validateRegExp(regex);
  param_validator.validateNumber(num);

  if (isEmptyArr(sentences)) {
    return [];
  }
  if (!(regex instanceof RegExp)) {
    return sentences;
  }
  if (num < 0) {
    throw new Error(`num ${num} must be a non-negative number`);
  }
  return sentences.reduce((acc, sentence, i) => {
    if (sentence && regex.test(sentence)) {
      let sentences_to_keep = sentences.slice(
        // prevents from wrapping around the end of the array
        Math.max(0, i - num),
        // If end >= array.length, array.length is used
        i + num + 1,
      );
      // check if the current sentence to add is the same as what was stored in accumulator at position -num
      // prevents from wrapping around the begining of the accumulator if num > acc.length
      if (sentence === acc.at(-Math.min(num, acc.length))) {
        // only keep the last element of `sentences_to_keep`
        acc.push(sentences_to_keep.pop());
      } else {
        acc = acc.concat(sentences_to_keep);
      }
    }
    return acc;
  }, []);
}
