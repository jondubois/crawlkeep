import { tryRegExp } from "./utils/shared/manip-str/modules/try-regexp.js";

function parseStringAsXset(s) {
  return s
    .split(/\s+\band\b\s+|(?<!\s+and\b)\s+\(|\)\s+(?!\band\b)/i)
    .map((el) =>
      el
        .split(/\s+\bor\b\s+/i)
        .map((ii) =>
          ii
            .replace(/\s*\)\s*/g, "")
            .replace(/\s*\(\s*/g, "")
            .replace(/\s+/g, ".{0,3}")
            .replace(/"/g, "\\b")
            .replace(/\*\*\*/g, ".{0,60}")
            .replace(/\*/g, ".{0,1}"),
        )
        .reduce((a, b) => a + "|" + b),
    )
    .filter((el) => el)
    .map((r) => r.replace(/\+/g, "\\+"));
}
function permutateNear(input) {
  var nearx = /(?<=\||^)\S+?(?=\||$)/g;
  var base = input.replace(nearx, "").replace(/[\|]+/g, "|");
  var near_or = input.match(nearx)
    ? input
        .match(nearx)
        .map((str) => {
          let joiners = input.match(/~\d*/g)?.[0]
            ? Array.from(input.match(/~\d*/g)).map((d) =>
                /\d+/.test(d) ? `.{0,${/\d+/.exec(d)?.[0]}}` : `.{0,29}`,
              )
            : [];
          let arr = str.split(/~[\d*]/);
          if (arr.length > 5) {
            return str.replace(/[~]+[\d*]/g, ".");
          } else {
            var cont = [];
            var containArr = [];
            function comboLoop(arr, cont) {
              if (arr.length == 0) {
                var row = cont.join(".{0,29}");
                containArr.push(row);
              }
              for (let i = 0; i < arr.length; i++) {
                var x = arr.splice(i, 1);
                cont.push(x);
                comboLoop(arr, cont);
                cont.pop();
                arr.splice(i, 0, x);
              }
            }
            comboLoop(arr, cont);
            return containArr.reduce((a, b) => a + "|" + b);
          }
        })
        .flat()
        .reduce((a, b) => a + "|" + b)
    : "";
  return base + near_or;
}

export function buildSearchSet(str, flags) {
  if (str) {
    var set = parseStringAsXset(str);
    var xset = set
      .map((r) => permutateNear(r))
      .map((r) => tryRegExp(r.replace(/^\||\|$/g, ""), flags));
    return xset;
  } else {
    return null;
  }
}

function decorationObjectMapper(arr, key) {
  return arr.map((p, i, r) => {
    let is_arr = typeof p === "object";
    return is_arr ? arrDiver(p, r[i - 1]) : { [key]: p };
  });
}
function decorationToArray(str) {
  var arr = JSON.parse(
    decodeURIComponent(str)
      .split(/(?<=,)/)
      .map((key) => key.replace(/[^\(\),]+/g, (s) => `"${s}"`))
      .reduce((a, b) => a + b)
      .replace(/\(/g, "[")
      .replace(/\)/g, "]")
      .replace(/"\[/g, '",['),
  );
  return arr;
  // console.log(arr)
  // return decorationObjectMapper(arr,'decoration')
}
function arrayToDecoration(arr) {
  return encodeURIComponent(
    JSON.stringify(arr)
      .replace(/",\[/g, "[")
      .replace(/\[/g, "(")
      .replace(/\]/g, ")")
      .replace(/"/g, ""),
  )
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

/*
  https://github.com/andrebradshaw/utilities/blob/master/booleanParser2.js
*/

function parseSearchStringAsRegexSet(search_string, flag) {
  function tryRegExp(s, f) {
    try {
      return new RegExp(s, f);
    } catch (err) {
      return err;
    }
  }
  var and_array = search_string.split(/\sand\s/i).map((i) => i.trim());
  var isNearORSearch = (s) => /~\d*\s*\(|~\s*\(|\)\s*~/.test(s);
  var splitOr = (s) => s.split(/\s+OR\s+|\|/i).map((i) => i.trim());
  var perm = (a) =>
    a.length
      ? a.reduce(
          (r, v, i) => [
            ...r,
            ...perm([...a.slice(0, i), ...a.slice(i + 1)]).map((x) => [
              v,
              ...x,
            ]),
          ],
          [],
        )
      : [[]];
  var unqHsh = (a, o) =>
    a.filter((i) => (o.hasOwnProperty(i) ? false : (o[i] = true)));
  var splitNonPermuOr = (s) => s.split(/\sOR\s(?!.+?\))/i);
  //\sOR\s(?=\(.+?\)~)
  var processForRexExp = (s) =>
    s
      .replace(/"/g, "\\b")
      .replace(/\*\*\*/g, ".{0,60}")
      .replace(/\*/g, ".{0,1}")
      .replace(/\+/g, "\\+");

  var processRemainingSearchString = (s) =>
    s
      .trim()
      .split(/\s+\bor\b\s+/i)
      .map((ii) =>
        ii
          .replace(/\s*\)\s*/g, "")
          .replace(/\s*\(\s*/g, "")
          .replace(/\s+/g, ".{0,3}")
          .replace(/"/g, "\\b")
          .replace(/\*\*\*/g, ".{0,60}")
          .replace(/\*/g, ".{0,1}")
          .replace(/\+/g, "\\+"),
      )
      .reduce((a, b) => a + "|" + b);

  function processNearORstatemensts(input) {
    var extractNearORGroups = (arr) =>
      arr.map((itm, i, r) =>
        itm === r[0]
          ? identifyNearGroupFirstItm(itm)
          : itm === r.at(-1)
            ? identifyNearGroupLastItm(itm)
            : /\(/.test(itm)
              ? /\(.+?\)/.exec(itm)?.[0]
              : /.+?(?=\sOR\s)/i.exec(itm)?.[0],
      );
    /* NOTE/TODO => If user uses | instead of OR, this will be a problem*/

    var identifyNearGroupFirstItm = (s) =>
      /\)$/.test(s)
        ? Array.from(s.match(/\(.+?\)/g)).at(-1)
        : s.split(/\sOR\s/i).at(-1);
    var identifyNearGroupLastItm = (s) =>
      /^\(/.test(s)
        ? Array.from(s.match(/\(.+?\)/g))[0]
        : s.split(/\sOR\s/i)[0];
    if (isNearORSearch(input)) {
      let joiners = input.match(/~\d*/g)?.[0]
        ? Array.from(input.match(/~\d*/g)).map((d) =>
            /\d+/.test(d) ? `.{0,${/\d+/.exec(d)?.[0]}}` : `.{0,29}`,
          )
        : [];
      let near_items = extractNearORGroups(input.split(/~\d*/))
        .map((itm) => splitOr(processForRexExp(itm)))
        .map((r) => (r.some((i) => /\(|\)/.test(i)) ? r : [r[0]]));
      let near_perms = perm(near_items)
        .map((arr) =>
          arr
            .map((r2) => r2.reduce((a, b) => a + "|" + b))
            .map((itm, i) => itm + (joiners[i] ? joiners[i] : ""))
            .reduce((a, b) => a + b),
        )
        .map((itm) => `(${itm})`)
        .reduce((a, b) => a + "|" + b);

      let remove_this_string_from_input = near_items
        .map((itm, i, rr) =>
          itm[0] === rr.at(-1)[0]
            ? itm
                .at(-1)
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/\\b/g, '"')
            : itm[0]
                .replace(/\(/g, "\\(")
                .replace(/\)/g, "\\)")
                .replace(/\\b/g, '"'),
        )
        .reduce((a, b) => a + ".+?" + b);

      let remaining_input = processRemainingSearchString(
        input.replace(
          new RegExp(remove_this_string_from_input, "i"),
          `_____REPLACER_____`,
        ),
      );
      return {
        permutation_x_string: near_perms,
        remaining_input: remaining_input,
        fully_parsed: remaining_input.replace(
          /_____REPLACER_____/,
          `(${near_perms})`,
        ),
      };
    } else return null;
  }

  function processNonMultiNear(input) {
    let joiners = input.match(/~\d*/g)?.[0]
      ? Array.from(input.match(/~\d*/g)).map((d) =>
          /\d+/.test(d) ? `.{0,${/\d+/.exec(d)?.[0]}}` : `.{0,29}`,
        )
      : [];
    let items = perm(input.split(/~\d*/));
    return items
      .map((arr) =>
        arr
          .map((itm, i) => itm + (joiners[i] ? joiners[i] : ""))
          .reduce((a, b) => a + b),
      )
      .reduce((a, b) => a + "|" + b);
  }

  let and_sets = and_array.map((and) => {
    let multi_near = processNearORstatemensts(and);
    return multi_near?.fully_parsed
      ? multi_near?.fully_parsed
      : processRemainingSearchString(processNonMultiNear(and));
  });
  return and_sets.map((xs) => tryRegExp(xs, flag)).filter((x) => x)?.[0];
}

export function parseSearchStringAs3DimensionalRegexSet(s, flag) {
  return parseBooleanQuery(s).map((ors) =>
    ors.map((ands) => parseSearchStringAsRegexSet(ands, flag)),
  );
}

// Boolean-parser.js
// -----------------
// License: MIT
// More information on what this does, and how the whole library works can be
// found in the README.md or on the github page.
// https://github.com/riichard/boolean-parser-js/blob/master/README.md
function _arraysAreEqual(arrA, arrB) {
  if (!Array.isArray(arrA) || !Array.isArray(arrB)) {
    throw new TypeError("both parameters have to be an array");
  }
  if (arrA.length !== arrB.length) {
    return false;
  }
  for (var i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
}
function parseBooleanQuery(searchPhrase) {
  searchPhrase = removeOuterBrackets(searchPhrase);
  searchPhrase = removeDoubleWhiteSpace(searchPhrase);
  var ors = splitRoot("OR", searchPhrase);
  var orPath = ors.map(function (andQuery) {
    var ands = splitRoot("AND", andQuery);
    var nestedPaths = [];
    var andPath = [];
    for (var i = 0; i < ands.length; i++) {
      if (containsBrackets(ands[i])) {
        nestedPaths.push(parseBooleanQuery(ands[i]));
      } else {
        andPath.push(ands[i]);
      }
    }
    nestedPaths.push([andPath]);
    return orsAndMerge(nestedPaths);
  });

  return mergeOrs(orPath);
}

function removeDoubleWhiteSpace(phrase) {
  return phrase.replace(/[\s]+/g, " ");
}

function orAndOrMerge(orPathA, orPathB) {
  var result = [];
  orPathA.forEach(function (andPathA) {
    orPathB.forEach(function (andPathB) {
      result.push(andAndMerge(andPathA, andPathB));
    });
  });

  return result;
}

function orsAndMerge(ors) {
  var result = [[]];
  for (var i = 0; i < ors.length; i++) {
    result = orAndOrMerge(result, ors[i]);
  }

  return result;
}

function deduplicateOr(orPath, orderMatters) {
  var path = orderMatters
    ? orPath
    : orPath.map(function (item) {
        return item.sort();
      });

  return path.reduce(function (memo, current) {
    for (var i = 0; i < memo.length; i++) {
      if (_arraysAreEqual(memo[i], current)) {
        return memo;
      }
    }
    memo.push(current);
    return memo;
  }, []);
}

function andAndMerge(a, b) {
  return a.concat(b);
}
function mergeOrs(ors) {
  var result = ors[0];
  for (var i = 1; i < ors.length; i++) {
    result = result.concat(ors[i]);
  }

  return result;
}
function removeOuterBrackets(phrase) {
  if (phrase.charAt(0) === "(") {
    var counter = 0;
    for (var i = 0; i < phrase.length; i++) {
      if (phrase.charAt(i) === "(") counter++;
      else if (phrase.charAt(i) === ")") counter--;
      if (counter === 0) {
        if (i !== phrase.length - 1) {
          return phrase;
        } else {
          return phrase.substring(1, phrase.length - 1);
        }
      }
    }
  }

  return phrase;
}

function containsBrackets(str) {
  return !!~str.search(/\(|\)/);
}

function splitRoot(splitTerm, phrase) {
  var termSplit = phrase.split(" " + splitTerm + " ");
  var result = [];
  var tempNested = [];
  for (var i = 0; i < termSplit.length; i++) {
    if (containsBrackets(termSplit[i]) || tempNested.length > 0) {
      tempNested.push(termSplit[i]);
      var tempNestedString = "" + tempNested;
      var countOpeningBrackets = (tempNestedString.match(/\(/g) || []).length;
      var countClosingBrackets = (tempNestedString.match(/\)/g) || []).length;

      if (countOpeningBrackets === countClosingBrackets) {
        result.push(tempNested.join(" " + splitTerm + " "));
        tempNested = [];
      }
    } else {
      result.push(termSplit[i]);
    }
  }

  return result;
}
