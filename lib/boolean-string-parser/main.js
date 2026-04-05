/*
  https://github.com/andrebradshaw/utilities/blob/master/booleanParser2.js
*/
import { toRegexPatternFromSpeChar } from "../../utils/manip-str/index.js";
import {
  toAllPermutations,
  processNonMultiNear,
  processNearORstatement,
} from "./index.js";

import { parseBooleanQuery } from "./riichard-parser.js";

export function parseSearchStringAsRegexSet(search_string, flag) {
  //   const splitOr = (s) => s.split(/\s+OR\s+|\|/i).map((i) => i.trim());

  /*   const splitNonPermuOr = (s) => s.split(/\sOR\s(?!.+?\))/i);



  function parseSearchStringAs3DimensionalRegexSet(s, flag) {
    // let test = parseSearchStringAsRegexSet(s, flag);
    return parseBooleanQuery(s).map((ors) =>
      ors.map((ands) => parseSearchStringAsRegexSet(ands, flag)),
    );
  } */

  var and_array = search_string.split(/\sand\s/i).map((i) => i.trim());
  let and_sets = and_array.map((and) => {
    let multi_near = processNearORstatement(and);
    return multi_near?.fully_parsed
      ? multi_near?.fully_parsed
      : processRemainingSearchString(processNonMultiNear(and));
  });
  return and_sets.map((xs) => tryRegExp(xs, flag)).filter((x) => x); // ?.[0]
}

const near_str = "developer~3python AND java~5javascript";
const bool_search_str =
  "micro_frontend_development AND (certificate OR Python)";
const bool_search_str3 =
  "micro_frontend_development AND (gui OR coding_language) AND Java OR (Python AND C++)";
const bool_near_str = 'developer~3python" AND (javascript OR Ruby)';
//
const all_combinations = parseBooleanQuery(bool_near_str);
let rx_patterns = all_combinations.map((arr) =>
  arr
    .flatMap((str) => processNonMultiNear(str))
    .flatMap((str) => toRegexPatternFromSpeChar(str)),
);
let rx = rx_patterns.map((arr) =>
  arr.flatMap((pattern) => new RegExp(pattern, "i")),
);

debugger;

// const flag = "i";
// const sentence3 =
//   '("bcba" AND ("test" OR "test1") OR "lba") AND (therap OR consult)';
// let regexSet3 = parseSearchStringAsRegexSet(sentence3, flag);
// const noMatch = regexSet3.some((regex) => regex.test("bcba test apple"));
// debugger;
// don't use a !OR
