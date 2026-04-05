import { splitToFragments } from "../split-to-fragments.js";
import { describe, it, expect } from "@jest/globals";

describe("splitToFragments function", () => {
  it("should correctly split a sentence with various dash characters into fragments", () => {
    const sentence =
      "Front-end - development, UI/UX – design, software—engineering | project–management";
    const levels = [
      /(?:\s+(?:-|‐|‑|‒|–|—|―|−)\s+)/gim,
      /(?:\s*(?:\||\\|\/)\s*)/gim,
    ]; // Define levels array according to the expected usage in the test cases
    const expected = [
      ["Front-end"],
      ["development, UI", "UX"],
      ["design, software—engineering", "project–management"],
    ];

    expect(splitToFragments(sentence, levels)).toEqual(expected);
  });

  it("should split a sentence with punctuation into fragments correctly", () => {
    const sentence = "This, is; a test: sentence.";
    const levels = [/[,;]/, /[:]/]; // Adjust levels for punctuation
    const expected = [["This"], ["is"], ["a test", "sentence."]];

    expect(splitToFragments(sentence, levels)).toEqual(expected);
  });

  it("should split a string with enclosing characters into fragments correctly", () => {
    const sentence =
      "software engineer (front-end) 'react development / angular / vueJS' of { systems }";
    const levels = [
      /\[(.+?)\]|\((.+?)\)|\"(.+?)\"/im,
      /\'(.+?)\'/im,
      /|\{(.+?)\}/im,
    ]; // Adjust levels for enclosing characters
    const expected = [
      ["software engineer"],
      ["front-end"],
      ["react development / angular / vueJS", ["of", "systems"]],
    ];

    expect(splitToFragments(sentence, levels)).toEqual(expected);
  });

  it("should throw an error when the input is not a string or levels is not an array", () => {
    const notString = 123;
    const levels = [/someRegexPattern/];
    expect(() => splitToFragments(notString, levels)).toThrowError(
      new Error(
        "splitToFragments - Invalid input. Expected a string and an Array.",
      ),
    );
  });
});
