import { permutate } from "../../../utils/manip-arr/index.js";

// TODO - to be decommissioned. incorrect
export function permutateNear(str) {
  if (typeof str !== "string") {
    throw new TypeError(
      `permutateNear - Invalid input. Expected ${str} to be a String. Instead, had ${typeof str}`,
    );
  }
  // let joiners = str.match(/~\d*/g)?.[0] // all results matching the complete RegExp returned, capturing groups not included
  //   ? Array.from(str.match(/~\d*/g)).map((d) =>
  //       /\d+/.test(d) ? `.{0,${/\d+/.exec(d)?.[0]}}` : `.{0,29}`,
  //     )
  //   : [];
  /****************************************************************************************************************************** */
  //   const regex = /~(\d*)/g;
  // let match;
  // const joiners = [];

  // while ((match = regex.exec(str)) !== null) { // exec() is stateful: it returns the next match (including capturing groups)
  //   // Use the captured group, default to 29 if the group is empty
  //   const range = match[1] ? match[1] : "29";
  //   joiners.push(`.{0,${range}}`);
  // }
  /****************************************************************************************************************************** */
  let matches = str.matchAll(/~(\d*)/g);
  // if (!matches) {
  //   return str;
  // }
  let joiners = Array.from(
    matches,
    (match_iterable) => `.{0,${match_iterable[1] || 29}}`,
  ); /* Array.from(iterable, mapFn) can take two arguments. The first argument is an array-like or iterable object.
    the second, is a map function to call on every element of the array.
    .matchAll() used with a regular expression that contains capturing groups, each match is an iterator of all matches, where the entire match is the first element and any captured groups as subsequent */

  let permutations = permutate(str.split(/~\d*/));
  // TODO - Debug, by only permutating the groups linked by the same "joiner"
  return permutations
    .map((arr) =>
      arr
        .map((itm, i) => itm + (joiners[i] ? joiners[i] : ""))
        .reduce((a, b) => a + b),
    )
    .join("|");
}
