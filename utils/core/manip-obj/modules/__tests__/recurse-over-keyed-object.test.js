import { recurseOverKeyedObject } from "../recurse-over-keyed-object.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isEmptyArr } from "../../../check/modules/is-empty-arr.js";
import { isKeyedObject } from "../../../check/modules/is-keyed-obj.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-empty-arr.js");
jest.mock("../../../check/modules/is-keyed-obj.js");

describe("recurseOverKeyedObject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw a TypeError for invalid input types", () => {
    const obj = "invalid";
    const callback = () => {};

    typeOf.mockReturnValueOnce("String").mockReturnValueOnce("Function");

    expect(() => recurseOverKeyedObject(obj, callback)).toThrow(TypeError);
  });

  test("should return the original object if it is empty", () => {
    const obj = {};
    const callback = jest.fn();

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(true);

    const result = recurseOverKeyedObject(obj, callback);
    expect(result).toEqual(obj);
  });

  test("should apply the callback to each keyed object in an array", () => {
    const obj = {
      key1: [{ a: 1 }, { b: 2 }],
      key2: "value2",
    };
    const callback = jest.fn((item) => ({ ...item, modified: true }));

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isEmptyArr.mockReturnValue(false);
    isKeyedObject.mockReturnValue(true);

    const result = recurseOverKeyedObject(obj, callback);
    expect(result).toEqual({
      key1: [
        { a: 1, modified: true },
        { b: 2, modified: true },
      ],
      key2: "value2",
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("should apply the callback to each non-array value", () => {
    const obj = {
      key1: "value1",
      key2: "value2",
    };
    const callback = jest.fn((item) => {
      const key = Object.keys(item)[0];
      return { [key]: `${item[key]}_modified` };
    });

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isEmptyArr.mockReturnValue(true);

    const result = recurseOverKeyedObject(obj, callback);
    expect(result).toEqual({
      key1: "value1_modified",
      key2: "value2_modified",
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("should handle mixed arrays and non-array values", () => {
    const obj = {
      key1: [{ a: 1 }, { b: 2 }],
      key2: "value2",
      key3: [{ c: 3 }],
    };
    const callback = jest.fn((item) => {
      if (Array.isArray(item)) {
        return item.map((o) => ({ ...o, modified: true }));
      } else {
        const key = Object.keys(item)[0];
        return { [key]: `${item[key]}_modified` };
      }
    });

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isEmptyArr.mockReturnValue(false);
    isKeyedObject.mockReturnValue(true);

    const result = recurseOverKeyedObject(obj, callback);
    expect(result).toEqual({
      key1: [
        { a: 1, modified: true },
        { b: 2, modified: true },
      ],
      key2: "value2_modified",
      key3: [{ c: 3, modified: true }],
    });
    expect(callback).toHaveBeenCalledTimes(4);
  });
});
