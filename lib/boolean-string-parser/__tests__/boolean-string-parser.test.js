import { parseSearchStringAsRegexSet } from "../modules/boolean-string-parser.js";
import { describe, test, beforeAll, it, expect } from "@jest/globals";

describe("parseSearchStringAsRegexSet with complex queries", () => {
  const flag = "i";
  const sentence0 =
    '(chili OR bumper OR tomato) OR ("bcba" AND ("test" OR "test1") OR "lba") AND (therap OR consult) OR (work OR play) OR (bunny OR frog OR tomato)';
  const sentence1 = 'developer AND ("Node" OR "React")';
  const sentence2 = 'javascript OR (developer AND ("Node" OR "React"))';
  let regexSet0, regexSet1, regexSet2;

  beforeAll(() => {
    regexSet0 = parseSearchStringAsRegexSet(sentence0, flag);
    regexSet1 = parseSearchStringAsRegexSet(sentence1, flag);
    regexSet2 = parseSearchStringAsRegexSet(sentence2, flag);
  });

  test("regexSet0 should be an array of RegExp objects", () => {
    expect(Array.isArray(regexSet0)).toBeTruthy();
    expect(regexSet0.every((regex) => regex instanceof RegExp)).toBeTruthy();
  });

  test('regexSet0 should match "chili therap", "bumper work", and "tomato bunny" but not "apple computer"', () => {
    const shouldMatch = ["chili therap", "bumper work", "tomato bunny"];
    const shouldNotMatch = "apple computer";
    const matches = shouldMatch.map((testStr) => {
      return regexSet0.some((regex) => regex.test(testStr));
    });
    const noMatch = regexSet0.some((regex) => regex.test(shouldNotMatch));
    expect(matches.every((m) => m)).toBeTruthy();
    expect(noMatch).toBeFalsy();
  });

  test('regexSet0 should match "bcba test therap" but not "bcba test apple"', () => {
    const shouldMatch = ["bcba test therap"];
    const shouldNotMatch = "bcba test apple";
    const matches = shouldMatch.map((testStr) => {
      return regexSet0.some((regex) => regex.test(testStr));
    });
    const noMatch = regexSet0.some((regex) => regex.test(shouldNotMatch));
    expect(matches.every((m) => m)).toBeTruthy();
    expect(noMatch).toBeFalsy();
  });

  test("regexSet1 should be an array of RegExp objects", () => {
    expect(Array.isArray(regexSet1)).toBeTruthy();
    expect(regexSet1.every((regex) => regex instanceof RegExp)).toBeTruthy();
  });

  test('regexSet1 should match "developer Node" and "developer React" but not "developer Angular"', () => {
    const shouldMatch = ["developer Node", "developer React"];
    const shouldNotMatch = "developer Angular";
    const matches = shouldMatch.map((testStr) => {
      return regexSet1.every((regex) => regex.test(testStr));
    });
    const noMatch = regexSet1.every((regex) => regex.test(shouldNotMatch));
    expect(matches.every((m) => m)).toBeTruthy();
    expect(noMatch).toBeFalsy();
  });

  test("regexSet2 should be an array of RegExp objects and its length should be 2", () => {
    expect(Array.isArray(regexSet2)).toBeTruthy();
    expect(regexSet2.every((regex) => regex instanceof RegExp)).toBeTruthy();
    expect(regexSet2.length).toBe(2);
  });

  test('regexSet2 should match "javascript", "developer Node", and "developer React"', () => {
    const shouldMatch = ["javascript", "developer Node", "developer React"];
    const matches = shouldMatch.map((testStr) => {
      return regexSet2.some((regex) => regex.test(testStr));
    });
  });
});
