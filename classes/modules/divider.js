// import param_validator from "./param-validator.js";

export class Divider {
  constructor(operator, flag = "gim") {
    this.operator = operator;
    this.flag = flag;
    this.regex_pattern = `\\b(?:\\s+\\b${this.operator}\\b\\s+)\\b`;
  }

  assignSetMethod = () => {
    /* whilst it's featured in MDN doc (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#set_composition),
      in JS, the Set class doesn't have built-in methods for set operations like union, intersection, difference, etc */
    switch (this.operator.toUpperCase()) {
      case "AND":
        return (set1, set2) => new Set([...set1].filter((x) => set2.has(x)));
      case "OR":
        return (set1, set2) => new Set([...set1, ...set2]);
      case "NOT":
        return (set1, set2) => new Set([...set1].filter((x) => !set2.has(x)));
      default:
        return (set1, set2) => new Set([...set1, ...set2]);
    }
  };

  composeSet = (set1, set2) => {
    const set_method = this.assignSetMethod();
    return set_method(set1, set2);
  };

  assignCheckMethod = () => {
    switch (this.operator.toUpperCase()) {
      case "AND":
        // check if all elements in the array are true
        return (arr) => arr.every((x) => x === true);
      case "OR":
        return (arr) => arr.some((x) => x === true);
      case "NOT":
        return (arr) => arr.every((x) => x === false);
      default:
        return (arr) => arr.some((x) => x === true);
    }
  };

  booleanCheck = (arr) => {
    const check_method = this.assignCheckMethod();
    return check_method(arr);
  };

  tryRegExp = (str = this.regex_pattern, flag = this.flag) => {
    if (!str) return /^$/;

    try {
      return new RegExp(str, flag);
    } catch (err) {
      try {
        return new RegExp(str.replace(/\W+/g, "\\W+?"), flag);
      } catch (rr) {
        // preserve stack trace whilst adding context
        rr.message = `Whilst processing ${this.constructor.name}.tryRegExp - Failed to convert to RegExp for input "${str}" and flag "${flag}": ${rr.message}`;
        throw rr;
      }
    }
  };
}

export class LeadTrailingDivider extends Divider {
  constructor(operator, flag) {
    super(operator, flag); // inherit `operator` from the superclass constructor
    // override `regex_pattern` to match only leading or trailing operators
    this.regex_pattern = `^\\s*\\b(?<l_operator>${this.operator})\\b\\s+|\\s+\\b(?<t_operator>${this.operator})\\b\\s*$`; // can't use named capture groups with the same name (`operator`) more than once.
    // `.groups` property is an object containing named capturing groups.
  }
}

export class EnclosingDivider extends Divider {
  constructor(
    operator,
    pairs = [
      ["[", "]"],
      ["{", "}"],
      ["(", ")"],
      ['"', '"'],
      ["'", "'"],
    ],
    flag = "im",
  ) {
    super(operator, flag);
    this.pairs = pairs;
    this.regex_pattern = this.generatePattern();
  }

  generatePattern = () => {
    const escape_char = "\\";
    return this.pairs
      .map((pair) => pair.map((elm) => `${escape_char}${elm}`).join("(.*)"))
      .join("|");
  };
}

// // use case
// const odds = new Set([1, 3, 5, 7, 9]);
// const squares = new Set([1, 4, 9]);
// const and_divider = new Divider("AND");
// const or_divider = new Divider("OR");

// const intersection = and_divider.composeSet(odds, squares);
// const union = or_divider.composeSet(odds, squares);
// const check_and = and_divider.booleanCheck([true, false, true]);
// const check_or = or_divider.booleanCheck([true, false, true]);
