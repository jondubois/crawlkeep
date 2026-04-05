import {
  isBoolExpres,
  extractFromObjBy,
  keepSurroundingSentences,
  deDupArr,
  tryRegExp,
} from "../../utils/index.js";

export class BooleanParser {
  static instance = null; // initializes the static instance to null
  #kw_key = "keyword";
  #rx_key = "regexps";
  #bool_key = "is_match";
  #matches_key = "matching_texts";
  #surrounding_sentences_key = "surrounding_sentences";
  #flag = "gim";

  #validateInput(bool_search_str) {
    if (typeof bool_search_str !== "string") {
      throw new TypeError(
        `BooleanParser - Invalid input. Expected ${bool_search_str} to be a string. Instead, was passed ${typeof bool_search_str}`,
      );
    }
    if (!bool_search_str) {
      throw new Error(
        `${this.constructor.name}.validateInput - Invalid input: ${bool_search_str} cannot be an empty String.`,
      );
    }
  }

  // Singleton pattern
  constructor() {
    if (BooleanParser.instance) {
      return BooleanParser.instance;
    }
    this.bool_search_str = "";
    this.equivalence_containers = [];

    this.validateInput = this.#validateInput.bind(this);
    BooleanParser.instance = this;
  }
  // factory pattern
  static getInstance() {
    if (!BooleanParser.instance) {
      BooleanParser.instance = new BooleanParser();
    }
    return BooleanParser.instance;
  }

  get kw_key() {
    return this.#kw_key;
  }
  get matches_key() {
    return this.#matches_key;
  }
  get surrounding_sentences_key() {
    return this.#surrounding_sentences_key;
  }

  setStateTo(bool_search_str) {
    this.#validateInput(bool_search_str);
    // this.equivalence_containers = [];
    this.bool_search_str = bool_search_str;
  }

  /**
   * Extracts keywords from a search string.
   * @param {Function} callback - The callback function to process each keyword.
   * @returns {Array} - An array of objects representing the extracted keywords.
   * @throws {Error} - If the input is invalid.
   *
   * @todo - at `matches` overwrites. Yet, for the one sentence, each criteria tests against the whole RegExp at once.
   * @todo - what happens down the track, if `rx_pattern` is missing in `equi_obj`?
   */
  setEquivalence(callback) {
    if (typeof callback !== "function") {
      throw new TypeError(
        `${
          this.constructor.name
        }.setEquivalence - Invalid input. Expected ${callback} to be a function. Instead, was passed ${typeof callback}`,
      );
    }

    // construct equivalence container, based on keywords in the search string
    const rx = new RegExp(
      `\\b(?!AND|OR|\\(|\\))(?<${this.#kw_key}>\\S+)\\b`,
      this.#flag,
    );
    const iterator_matches = this.bool_search_str.matchAll(rx);
    this.equivalence_containers = Array.from(iterator_matches, (match) =>
      Object.fromEntries(Object.entries(match.groups)),
    ); // handles multiple capturing groups (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#indices)
    /* `String.prototype.matchAll()` returns an iterable iterator object (which is not restartable) of matches.
    Since the iterator was consumed by `equivalence_containers`, had to resort to an alternive method to get the keywords */

    // conditionally set `this.#rx_key` property as a level of equivalence
    this.equivalence_containers.forEach((equi_obj) => {
      let rx_pattern = callback(equi_obj[this.#kw_key]).join("|");
      Object.assign(equi_obj, {
        ...(rx_pattern && {
          [this.#rx_key]: tryRegExp(rx_pattern, this.#flag),
        }),
      }); // accounts for `rx_pattern` evaluating to an empty string. TODO - what happens down the track, if `rx_pattern` is missing in `equi_obj`?
    }); // mutates in-place
  }

  /**
   * Turn a keyword search string into a Boolean expression.
   * @param {string} paragraph - The paragraph to evaluate against the keywords.
   * @returns {string} - The Boolean expression.
   * @throws {Error} - If the input is invalid.
   */
  #toBoolExpres(paragraph) {
    if (typeof paragraph !== "string") {
      throw new TypeError(
        `${
          this.constructor.name
        }.#toBoolExpres - Invalid input. Expected ${paragraph} to be a String. Instead, was passed ${typeof paragraph}`,
      );
    }
    if (!paragraph) {
      return "";
    }
    const sentences = paragraph.match(/[^.!?]+[.!?]+[\])'"`’”]*|[^.!?]+$/g);
    // set `boolean_matches` property as another level of equivalence to `this.#kw_key`
    this.equivalence_containers.forEach((equi_obj) => {
      // // set both `boolean_matches` and `matching_text` properties
      // equi_obj[this.#bool_key] = equi_obj?.[this.#rx_key].some((rx) => {
      //   const matches = Array.from(paragraph.matchAll(rx));
      //   const excerpts = matches.map((match) => {
      //     const match = match[0] ?? match.groups;
      //   });
      //   if (matches.length > 0) {
      //     equi_obj[this.#matches_key] = matches;
      //   }
      //   return matches.length > 0;
      // });

      // equi_obj?.[this.#rx_key].forEach((rx) => {
      //   // rewind the pattern of `.match()`
      //   rx.lastIndex = 0; // Reset lastIndex to 0 to start the search from the beginning
      //   const matches = paragraph.match(rx); // If the g flag is used, all results matching the complete regular expression will be returned, but capturing groups are not included.RegExp.prototype.exec()
      //   if (matches) {
      //     equi_obj[this.#surrounding_sentences_key] = keepSurroundingSentences(
      //       sentences,
      //       rx,
      //       1,
      //     );
      //     equi_obj[this.#matches_key] = matches;
      //   }
      //   equi_obj[this.#bool_key] = !!matches;
      // });
      const rx = equi_obj?.[this.#rx_key];
      const matches = paragraph.match(rx); // If the g flag is used, all results matching the complete regular expression will be returned, but capturing groups are not included.RegExp.prototype.exec()
      if (matches) {
        // TODO - overwrites. Yet, for the one sentence, each criteria tests against the whole RegExp at once.
        // I don't see how ot could loop back
        equi_obj[this.#surrounding_sentences_key] = keepSurroundingSentences(
          sentences,
          rx,
          2,
        );
        equi_obj[this.#matches_key] = deDupArr(matches);
      }
      equi_obj[this.#bool_key] = !!matches;
    });
    // turn search string into a boolean expression, by substituting keywords with boolean values
    return (
      this.bool_search_str
        /* primitive values are not mutable — once a primitive value is created, it cannot be changed.
        Primitive values are passed by value, not by reference.
        `.replace()` does not mutate the string value it's called on, but returns a new string. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement)
        */
        .replace(/\b(?!AND|OR|\(|\))\S+\b/gim, (kw) => {
          return this.equivalence_containers.find(
            (equi_obj) => equi_obj[this.#kw_key] === kw,
          )[this.#bool_key];
        }) /* The callback function's result (return value) will be used as the replacement string (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_the_replacement) 
        A RegExp with the `g` flag is the only case where `replace()` replaces more than once (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#using_the_global_and_ignorecase_flags_with_replace) */
        .replace(/\bAND\b/gi, "&&")
        .replace(/\bOR\b/gi, "||")
    );
  }
  // #getGroups() {
  //   // reset
  //   const groups = {};
  //   for (let i = 0; i < this.equivalence_containers.length; i++) {
  //     groups[this.#equivalence_containers[i][this.#kw_key]] =
  //       this.equivalence_containers[i][this.#bool_key];
  //   }
  //   return groups;
  // }

  getMatchedNames() {
    return this.equivalence_containers
      .filter((equi_obj) => equi_obj[this.#bool_key])
      .map((equi_obj) => equi_obj[this.#kw_key]);
  } // Object.getOwnPropertyNames()

  getMatchmatchingContainers() {
    return this.equivalence_containers.filter(
      (equi_obj) => equi_obj[this.#bool_key],
    );
  }

  /**
   * Turn a Boolean expression into a Boolean.
   * @param {string} bool_exp - The Boolean expression.
   * @returns {boolean} - The result of the boolean expression evaluation.
   */
  #evaluateBoolExpres(bool_exp) {
    if (!isBoolExpres(bool_exp)) return false;
    try {
      return new Function(
        `return (${bool_exp})`,
      )(); /* security vulnerability: constructor creates a new function that executes in its own scope, which is isolated from the current scope. 
              Beyond its local scope, it only has access to the global scope */
      // return eval(bool_exp); /* security vulnerability: `eval()` executes code in the current scope, which means it can access and modify local attributes and methods */
    } catch (error) {
      // intentionally not mentioning eval() in the error message
      console.error(
        `${this.constructor.name}.evaluateBoolExpres - Error:`,
        error,
      );
      return false;
    }
  }

  isMatch(sentence_to_test) {
    // reset
    this.equivalence_containers = this.equivalence_containers.map(
      (equi_obj) => {
        // drops all properties related to the parsing of `sentence_to_test`,
        // leaving only the taxo related ones
        return extractFromObjBy(equi_obj, [this.#kw_key, this.#rx_key]);
      },
    );
    return this.#evaluateBoolExpres(this.#toBoolExpres(sentence_to_test));
  }
}
