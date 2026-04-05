import { toNodeTreeByRegexp } from "../to-node-tree-by-regexp.js";
import { describe, test, expect } from "@jest/globals";

const dividers = [
  {
    description: "near_operand",
    pattern: "▬\\d*",
    capturing_group_pattern: "(▬\\d*)",
    named_pattern: "(?<near_operand>▬\\d*)",
  },
  {
    description: "word",
    pattern: `\\w+`,
    capturing_group_pattern: "(\\w+)",
    named_pattern: `(?<word>\\w+)`,
  },
];

describe("toNodeTreeByRegexp", () => {
  test("should decompose the string into a tree structure", () => {
    const input_str = "Structur▬Engineer♥";
    const expected_tree = {
      label: "Structur▬Engineer♥",
      child_entries: [
        {
          label: "Structur",
          is_near_operand: false,
          child_entries: [
            {
              label: "Structur",
              is_word: true,
              child_entries: [],
            },
          ],
        },
        {
          label: "▬",
          is_near_operand: true,
          child_entries: [],
        },
        {
          label: "Engineer♥",
          is_near_operand: false,
          child_entries: [
            {
              label: "Engineer",
              is_word: true,
              child_entries: [],
            },
            {
              label: "♥",
              is_word: false,
              child_entries: [],
            },
          ],
        },
      ],
    };

    const tree = toNodeTreeByRegexp(input_str, dividers);
    expect(tree).toEqual(expected_tree);
  });
});
