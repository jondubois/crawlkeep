import { reduceJsonArrayBy } from "../reduce-json-array-by.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../../check/modules/is-json-array.js";
import { typeOf } from "../../../type-of.js";
import { jest, beforeEach, describe, test, expect } from "@jest/globals";

jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-json-array.js");
jest.mock("../../../type-of.js");

describe("reduceJsonArrayBy", () => {
  beforeEach(() => {
    isEmptyObj.mockClear();
    isJsonArray.mockClear();
    typeOf.mockClear();
  });

  test("should throw TypeError if inputs are not valid", () => {
    isJsonArray.mockReturnValue(false);
    expect(() => reduceJsonArrayBy(null, [])).toThrow(TypeError);
    expect(() => reduceJsonArrayBy([], null)).toThrow(TypeError);
    expect(() => reduceJsonArrayBy({}, [])).toThrow(TypeError);
    expect(() => reduceJsonArrayBy([], {})).toThrow(TypeError);
  });

  test("should return an empty array if input array is empty", () => {
    isJsonArray.mockReturnValue(true);
    expect(reduceJsonArrayBy([], ["id"])).toEqual([]);
  });

  test("should return the same array if there are no duplicates", () => {
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    const json_arr = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    const id_keys = ["id"];
    expect(reduceJsonArrayBy(json_arr, id_keys)).toEqual(json_arr);
  });

  test("should merge objects with the same id", () => {
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    const json_arr = [
      { id: 1, name: "Alice" },
      { id: 1, age: 30 },
    ];
    const id_keys = ["id"];
    const expected = [{ id: 1, name: "Alice", age: 30 }];
    expect(reduceJsonArrayBy(json_arr, id_keys)).toEqual(expected);
  });

  test("should handle multiple identifier keys", () => {
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    const json_arr = [
      { id: 1, type: "A", name: "Alice" },
      { id: 1, type: "B", name: "Bob" },
      { id: 1, type: "A", age: 30 },
    ];
    const id_keys = ["id", "type"];
    const expected = [{ id: 1, type: "A", name: "Bob", age: 30 }];
    expect(reduceJsonArrayBy(json_arr, id_keys)).toEqual(expected);
  });

  test("should ignore objects without identifier keys", () => {
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => {
      return Object.keys(obj).length === 0;
    });
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    const json_arr = [{ id: 1, name: "Alice" }, { name: "Bob" }];
    const id_keys = ["id"];
    const expected = [{ id: 1, name: "Alice" }];
    expect(reduceJsonArrayBy(json_arr, id_keys)).toEqual(expected);
  });

  test("should handle empty objects", () => {
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => {
      return Object.keys(obj).length === 0;
    });
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    const json_arr = [{ id: 1, name: "Alice" }, {}];
    const id_keys = ["id"];
    const expected = [{ id: 1, name: "Alice" }];
    expect(reduceJsonArrayBy(json_arr, id_keys)).toEqual(expected);
  });

  test("should throw TypeError for invalid inputs", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(false);

    expect(() => reduceJsonArrayBy(null, ["id"])).toThrow(TypeError);
    expect(() => reduceJsonArrayBy([], "id")).toThrow(TypeError);
    expect(() => reduceJsonArrayBy([], ["id"])).toThrow(TypeError);
  });

  test("should merge JSON array by IDs", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);

    const jsonArray = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, age: 30 },
    ];
    const idKeys = ["id"];

    const result = reduceJsonArrayBy(jsonArray, idKeys);

    expect(result).toEqual([
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob" },
    ]);
  });

  test("should handle empty JSON array", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);

    const jsonArray = [];
    const idKeys = ["id"];

    const result = reduceJsonArrayBy(jsonArray, idKeys);

    expect(result).toEqual([]);
  });

  test("should handle JSON array with empty objects", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);

    const jsonArray = [{}];
    const idKeys = ["id"];

    const result = reduceJsonArrayBynArray, idKeys);

    expect(result).toEqual([]);
  });

  test("should handle JSON array with objects without ID keys", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);

    const jsonArray = [{ name: "Alice" }, { name: "Bob" }];
    const idKeys = ["id"];

    const result = reduceJsonArrayBy(jsonArray, idKeys);

    expect(result).toEqual([]);
  });

  test("should handle JSON array with mixed valid and invalid objects", () => {
    typeOf.mockImplementation((val) => {
      if (Array.isArray(val)) return "Array";
      if (val && typeof val === "object") return "Object";
      return typeof val;
    });

    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);

    const jsonArray = [
      { id: 1, name: "Alice" },
      { name: "Bob" },
      { id: 1, age: 30 },
    ];
    const idKeys = ["id"];

    const result = reduceJsonArrayBy(jsonArray, idKeys);

    expect(result).toEqual([{ id: 1, name: "Alice", age: 30 }]);
  });
});
