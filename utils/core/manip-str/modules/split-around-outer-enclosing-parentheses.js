import param_validator from "../../../../classes/modules/param-validator.js";

function removeOuterParentheses(str) {
  if (str.startsWith("(") && str.endsWith(")")) {
    return str.substring(1, str.length - 1);
  }
  return str;
}

export function splitAroundOuterEnclosingParentheses(bool_str) {
  param_validator.validateString(bool_str);

  if (!bool_str) {
    return [];
  }
  const fragments = [];
  let depth = 0;
  let start = 0;
  let buffer = "";

  for (let i = 0; i < bool_str.length; i++) {
    const char = bool_str[i];

    if (char === "(") {
      buffer = buffer.trim();
      if (depth === 0 && buffer) {
        fragments.push(buffer);
        buffer = "";
      }
      depth++;
      if (depth === 1) {
        start = i;
      }
    } else if (char === ")") {
      depth--;
      if (depth === 0) {
        buffer += bool_str.substring(start, i + 1);
        const enclosed_str = removeOuterParentheses(buffer.trim());
        if (enclosed_str) {
          fragments.push(enclosed_str);
          buffer = "";
        }
      }
    } else if (depth === 0) {
      buffer += char;
    }
  }

  const remainingPart = buffer.trim();
  if (remainingPart) fragments.push(remainingPart);

  return fragments;
}

// // keyword, not Boolean expression, enclosed in parentheses
// const bool_search_str3 =
//   "architect AND micro_frontend_development AND (test) OR crit1";
// // nested parentheses
// const bool_search_str4 =
//   "architect AND micro_frontend_development AND (crit1 AND (certificate OR Python)) OR crit2";
// // single keyword, not Boolean expression
// const bool_search_str5 = "crit2";
// // Boolean operator in between enclosing parentheses
// const bool_search_str6 =
//   "architect AND micro_frontend_development AND (certificate OR Python) AND (software OR Java) OR crit1";
// // combination of nested parentheses and successive parentheses
// const bool_search_str7 =
//   "sentence1 AND (software—engineering AND (FE AND (HTML OR CSS) AND (certificate OR Python))) OR crit1";
// // successive parentheses enclosed in parentheses
// const bool_search_str8 =
//   "software—engineering AND ((HTML OR CSS) OR (certificate OR Python))";

// let res0 = splitAroundOuterEnclosingParentheses(bool_search_str3);
// let res1 = splitAroundOuterEnclosingParentheses(bool_search_str4);
// let res2 = splitAroundOuterEnclosingParentheses(bool_search_str5);
// let res3 = splitAroundOuterEnclosingParentheses(bool_search_str6);
// let res4 = splitAroundOuterEnclosingParentheses(bool_search_str7);
// let res5 = splitAroundOuterEnclosingParentheses(bool_search_str8);
// debugger;
