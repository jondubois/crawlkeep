import { splitAroundOuterEnclosingParentheses } from "../../../manip-str/modules/
import { describe, test, expect } from "@jest/globals";

describe("splitAroundOuterEnclosingParentheses", () => {
  test("splits keyword, not Boolean expression, enclosed in parentheses", () => {
    const input =
      "architect AND micro_frontend_development AND (test) OR crit1";
    const expected = [
      "architect AND micro_frontend_development AND",
      "test",
      "OR crit1",
    ];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });

  test("splits nested parentheses", () => {
    const input =
      "architect AND micro_frontend_development AND (crit1 AND (certificate OR Python)) OR crit2";
    const expected = [
      "architect AND micro_frontend_development AND",
      "crit1 AND (certificate OR Python)",
      "OR crit2",
    ];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });

  test("handles single keyword, not Boolean expression", () => {
    const input = "crit2";
    const expected = ["crit2"];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });

  test("splits Boolean operator in between enclosing parentheses", () => {
    const input =
      "architect AND micro_frontend_development AND (certificate OR Python) AND (software OR Java) OR crit1";
    const expected = [
      "architect AND micro_frontend_development AND",
      "certificate OR Python",
      "AND",
      "software OR Java",
      "OR crit1",
    ];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });

  test("splits combination of nested parentheses and successive parentheses", () => {
    const input =
      "sentence1 AND (software—engineering AND (FE AND (HTML OR CSS) AND (certificate OR Python))) OR crit1";
    const expected = [
      "sentence1 AND",
      "software—engineering AND (FE AND (HTML OR CSS) AND (certificate OR Python))",
      "OR crit1",
    ];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });

  test("splits successive parentheses enclosed in parentheses", () => {
    const input =
      "software—engineering AND ((HTML OR CSS) OR (certificate OR Python))";
    const expected = [
      "software—engineering AND",
      "(HTML OR CSS) OR (certificate OR Python)",
    ];
    expect(splitAroundOuterEnclosingParentheses(input)).toEqual(expected);
  });
});
