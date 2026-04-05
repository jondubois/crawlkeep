import { tryRegExp } from "./try-regexp.js";

import { BaseParser } from "../../../../classes/modules/base/base-parser.js";
const base_parser = new BaseParser();
import param_validator from "../../../../classes/modules/param-validator.js";
const FLAG = "gim";
/**
 * @description Converts a string into a tree structure using regular expressions.
 * @param {string} input_str - The input string to be decomposed.
 * @param {Array} dividers - An array of objects containing the patterns and descriptions for decomposition.
 * @return {Object} - The root node of the resulting tree structure.
 * @requires required_props - The properties that must be present in each divider object.
 * @example
 * const dividers = [
    {
      description: "near_operand",
      pattern: "▬\\d*",
      capturing_group_pattern: "(▬\\d*)",
      named_pattern: "(?<near_operand>▬\\d*)",
    }]
 * 
 * 
 */
export function toNodeTreeByRegexp(input_str, dividers) {
  param_validator.validateString(input_str);
  param_validator.validateJsonArr(dividers);

  const required_props = ["description", "pattern", "capturing_group_pattern"];
  dividers.forEach((divider) => {
    if (!required_props.every((prop) => prop in divider)) {
      throw new Error(
        `toNodeTreeByRegexp - Invalid divider object. Expected ${divider} to have properties ${required_props}. Instead, was passed ${divider}`,
      );
    }
  });

  const child_entries_key = base_parser.child_entries_key; // "child_entries";
  const root_node = { label: input_str, [child_entries_key]: [] };
  const queue = [{ node: root_node, level: 0 }];

  while (queue.length > 0) {
    const { node, level } = queue.shift();
    if (level >= dividers.length) continue;

    const divider = dividers[level];
    const sub_strings = node.label
      .split(tryRegExp(divider.capturing_group_pattern, FLAG))
      .filter((part) => part.trim()); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split#splitting_with_a_regexp_to_include_parts_of_the_separator_in_the_result

    node[child_entries_key] = sub_strings.map((sub_string) => {
      const is_excel_symbol = tryRegExp(divider.pattern, FLAG).test(sub_string); // RegExp objects are stateful when they have the global flag
      return {
        label: sub_string,
        [`is_${divider.description}`]: is_excel_symbol,
        is_excel_symbol,
        [child_entries_key]: [],
      };
    });

    for (const child of node[child_entries_key]) {
      if (!child[`is_${divider.description}`]) {
        queue.push({ node: child, level: level + 1 });
      }
    }
  }

  return root_node;
}
