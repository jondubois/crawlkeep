import { mergeObjsByTopLvlValIsArr } from "../merge-objs-by.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { intersection } from "../../../manip-arr/modules/superpose-arr.js";
import { deDupArr } from "../../../manip-arr/modules/dedup-arr.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../manip-arr/modules/superpose-arr.js");
jest.mock("../../../manip-arr/modules/dedup-arr.js");

describe("mergeObjsByTopLvlValIsArr", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw a TypeError for invalid object types", () => {
    const obj1 = "invalid";
    const obj2 = { a: [1, 2, 3] };

    typeOf.mockReturnValueOnce("String").mockReturnValueOnce("Object");

    expect(() => mergeObjsByTopLvlValIsArr(obj1, obj2)).toThrow(TypeError);
  });

  test("should return the non-empty object if one object is empty", () => {
    const obj1 = {};
    const obj2 = { a: [1, 2, 3] };

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = mergeObjsByTopLvlValIsArr(obj1, obj2);
    expect(result).toEqual(obj2);
  });

  test("should merge arrays and de-duplicate common keys", () => {
    const obj1 = { a: [1, 2, 3], b: [4, 5, 6] };
    const obj2 = { a: [3, 4, 5], c: [7, 8, 9] };

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    intersection.mockReturnValue(["a"]);
    deDupArr.mockImplementation((arr) => Array.from(new Set(arr)));

    const result = mergeObjsByTopLvlValIsArr(obj1, obj2);
    expect(result).toEqual({ a: [1, 2, 3, 4, 5], b: [4, 5, 6], c: [7, 8, 9] });
  });

  test("should merge non-common properties", () => {
    const obj1 = { a: [1, 2, 3], b: "string1" };
    const obj2 = { c: [4, 5, 6], d: "string2" };

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    intersection.mockReturnValue([]);
    deDupArr.mockImplementation((arr) => Array.from(new Set(arr)));

    const result = mergeObjsByTopLvlValIsArr(obj1, obj2);
    expect(result).toEqual({
      a: [1, 2, 3],
      b: "string1",
      c: [4, 5, 6],
      d: "string2",
    });
  });

  test("should handle objects with no common keys", () => {
    const obj1 = { a: [1, 2, 3] };
    const obj2 = { b: [4, 5, 6] };

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    intersection.mockReturnValue([]);
    deDupArr.mockImplementation((arr) => Array.from(new Set(arr)));

    const result = mergeObjsByTopLvlValIsArr(obj1, obj2);
    expect(result).toEqual({ a: [1, 2, 3], b: [4, 5, 6] });
  });

  test("should handle objects with non-array common keys", () => {
    const obj1 = { a: [1, 2, 3], b: "string1" };
    const obj2 = { a: [3, 4, 5], b: "string2" };

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    intersection.mockReturnValue(["a", "b"]);
    deDupArr.mockImplementation((arr) => Array.from(new Set(arr)));

    const result = mergeObjsByTopLvlValIsArr(obj1, obj2);
    expect(result).toEqual({ a: [1, 2, 3, 4, 5], b: "string2" });
  });
});
