import { transposeRowToColumn } from "../transpose-row-to-column.js";
import { describe, test, expect } from "@jest/globals";

describe("transposeRowToColumn", () => {
  test("should throw TypeError for invalid inputs", () => {
    expect(() => transposeRowToColumn(null)).toThrow(TypeError);
    expect(() => transposeRowToColumn({})).toThrow(TypeError);
    expect(() => transposeRowToColumn("string")).toThrow(TypeError);
    expect(() => transposeRowToColumn([])).toThrow(TypeError);
  });

  test("should transpose rows to columns", () => {
    const input = [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Doe", age: 40 },
    ];
    const expected = {
      name: ["John", "Jane", "Doe"],
      age: [30, 25, 40],
    };
    expect(transposeRowToColumn(input)).toEqual(expected);
  });

  test("should handle arrays with different keys", () => {
    const input = [
      { name: "John", age: 30 },
      { name: "Jane", city: "New York" },
      { name: "Doe", age: 40, city: "Los Angeles" },
    ];
    const expected = {
      name: ["John", "Jane", "Doe"],
      age: [30, undefined, 40],
      city: [undefined, "New York", "Los Angeles"],
    };
    expect(transposeRowToColumn(input)).toEqual(expected);
  });
});
