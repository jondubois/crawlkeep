import { evaluateBooleanExpression } from "../evaluate-boolean-expression.js";
import { describe, test, expect } from "@jest/globals";

describe("evaluateBooleanExpression", () => {
  test("evaluates complex boolean expressions correctly", () => {
    const expression0 =
      "false AND true AND (true OR false) OR false AND (true) OR (false AND (false OR true)) AND (true OR false)";
    const result0 = evaluateBooleanExpression(expression0);
    expect(result0).toBe(false);

    const expression1 = "true AND (false) OR false";
    const result1 = evaluateBooleanExpression(expression1);
    expect(result1).toBe(false);
  });

  test("evaluates expressions with NOT operator", () => {
    const expression2 = "NOT true AND false";
    const result2 = evaluateBooleanExpression(expression2);
    expect(result2).toBe(false);

    const expression3 = "NOT (false OR true) AND true";
    const result3 = evaluateBooleanExpression(expression3);
    expect(result3).toBe(false);

    const expression4 = "true OR NOT false";
    const result4 = evaluateBooleanExpression(expression4);
    expect(result4).toBe(true);
  });

  test("evaluates expressions with mixed operators and precedence", () => {
    const expression5 = "true AND NOT false OR false";
    const result5 = evaluateBooleanExpression(expression5);
    expect(result5).toBe(true);

    const expression6 = "(true OR false) AND NOT (false AND true)";
    const result6 = evaluateBooleanExpression(expression6);
    expect(result6).toBe(true);

    const expression7 =
      "NOT (true AND false) OR (false AND NOT (false OR true))";
    const result7 = evaluateBooleanExpression(expression7);
    expect(result7).toBe(true);
  });
});
