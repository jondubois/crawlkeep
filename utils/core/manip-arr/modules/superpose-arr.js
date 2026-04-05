/* whilst it's featured in MDN doc (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition),
in JS, the Set class doesn't have built-in methods for set operations like union, intersection, difference, etc */

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Returns the intersection of two arrays.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} - An array containing the common elements of arr1 and arr2.
 */
export function intersection(arr1, arr2) {
  param_validator.validateArray(arr1);
  param_validator.validateArray(arr2);

  if (!arr1.length || !arr2.length) {
    // no common elements
    return [];
  }
  let set1 = new Set(arr1);
  let set2 = new Set(arr2);
  return [...set1].filter((x) => set2.has(x));
}

/**
 * @description Returns the union of two arrays.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} - An array containing the merger of arr1 with arr2.
 */
export function union(arr1, arr2) {
  param_validator.validateArray(arr1);
  param_validator.validateArray(arr2);

  if (!arr1.length) {
    return arr2;
  }
  if (!arr2.length) {
    return arr1;
  }
  let set1 = new Set(arr1);
  let set2 = new Set(arr2);
  return [...new Set([...set1, ...set2])];
}

// const entry1 = [
//   {
//     keyword: "executive_director",
//     matching_texts: ["Executive summary Director"],
//   },
//   {
//     keyword: "director",
//     matching_texts: ["Director"],
//   },
// ];
// const entry2 = [
//   {
//     keyword: "executive_director",
//     matching_texts: ["Exec summary Manager"],
//   },
// ];

// const entry_1 = [
//   {
//     keyword: "executive_director",
//     surrounding_sentences: ["Exec General Manager. EXISTING_certs_1"],
//     matching_texts: ["Exec summary Manager"],
//   },
// ];
// const entry_2 = [
//   {
//     keyword: "individual_contributor",
//     surrounding_sentences: [
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//       "  AREAS OF EXPERTISE: * Structural summary Engineering * Finite summary element Analysis",
//     ],
//     matching_texts: ["Engineer", "Engineers"],
//   },
//   {
//     keyword: "executive_director",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//     ],
//     matching_texts: ["Executive summary Director"],
//   },
//   {
//     keyword: "director",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//     ],
//     matching_texts: ["Director"],
//   },
//   {
//     keyword: "uxui_design",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//       "  AREAS OF EXPERTISE: * Structural summary Engineering * Finite summary element Analysis",
//     ],
//     matching_texts: ["Flows Map"],
//   },
//   {
//     keyword: "martech",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//       "  AREAS OF EXPERTISE: * Structural summary Engineering * Finite summary element Analysis",
//     ],
//     matching_texts: ["Flows Map and experience"],
//   },
//   {
//     keyword: "systems_engineering",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//     ],
//     matching_texts: ["Systems summary engineering"],
//   },
//   {
//     keyword: "mechanical_engineering",
//     surrounding_sentences: [
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//       "  AREAS OF EXPERTISE: * Structural summary Engineering * Finite summary element Analysis",
//     ],
//     matching_texts: ["Structural summary Engineering"],
//   },
//   {
//     keyword: "electronics_engineering",
//     surrounding_sentences: [
//       "Executive summary Director.",
//       " Systems summary engineering.",
//       " Technical Flows Map and experience in electronics summary engineering.",
//       " Registered Professional Engineer(PE) with Texas Board of Professional Engineers, Chartered Professional Engineer (CPEng) with Engineers Australia and Registered Professional Engineer Queensland(RPEQ).",
//       "  AREAS OF EXPERTISE: * Structural summary Engineering * Finite summary element Analysis",
//     ],
//     matching_texts: ["electronics summary engineering"],
//   },
// ];
// const uniq_arr = union(entry_1 || [], entry_2 || []);
// debugger;

/**
 * @description Returns the difference of two arrays.
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} - An array containing the what's NOT at the junction of arr1 and arr2.
 */
export function difference(arr1, arr2) {
  param_validator.validateArray(arr1);
  param_validator.validateArray(arr2);

  if (!arr1.length || !arr2.length) {
    return [];
  }
  let set1 = new Set(arr1);
  let set2 = new Set(arr2);

  return [
    ...[...set1].filter((x) => !set2.has(x)),
    ...[...set2].filter((x) => !set1.has(x)),
  ];
}
