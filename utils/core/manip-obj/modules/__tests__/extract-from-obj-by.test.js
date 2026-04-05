import { extractFromObjBy } from "../extract-from-obj-by.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { typeOf } from "../../../type-of.js";
import {
  jest,
  describe,
  afterEach,
  beforeEach,
  it,
  expect,
} from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");

describe("extractFromObjBy", () => {
  const obj = { name: "John", age: 30, school: "XYZ", degree: "CS" };

  beforeEach(() => {
    typeOf.mockImplementation((value) =>
      Object.prototype.toString.call(value).slice(8, -1),
    );
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw a TypeError if the first argument is not an object", () => {
    expect(() => extractFromObjBy(null, ["name"])).toThrow(TypeError);
    expect(() => extractFromObjBy(123, ["name"])).toThrow(TypeError);
    expect(() => extractFromObjBy("string", ["name"])).toThrow(TypeError);
  });

  it("should throw a TypeError if the second argument is not an array", () => {
    expect(() => extractFromObjBy(obj, null)).toThrow(TypeError);
    expect(() => extractFromObjBy(obj, 123)).toThrow(TypeError);
    expect(() => extractFromObjBy(obj, "string")).toThrow(TypeError);
  });

  it("should return the original object if target_keys is an empty array", () => {
    expect(extractFromObjBy(obj, [])).toEqual(obj);
  });

  it("should return the original object if the object is empty", () => {
    expect(extractFromObjBy({}, ["name"])).toEqual({});
  });

  it("should ignore properties not present in the object", () => {
    const obj = { name: "John", age: 30, school: "XYZ" };
    const target_keys = ["school", "degree"]; // 'degree' is not present in the object
    const expected = { school: "XYZ" };
    expect(extractFromObjBy(obj, target_keys)).toEqual(expected);
  });

  it("should keep only the properties whose keys are in target_keys", () => {
    const target_keys = ["school", "degree"];
    const expected = { school: "XYZ", degree: "CS" };
    expect(extractFromObjBy(obj, target_keys)).toEqual(expected);
  });

  it("should keep every property except the ones in target_keys when is_excluded is true", () => {
    const target_keys = ["school", "degree"];
    const expected = { name: "John", age: 30 };
    expect(extractFromObjBy(obj, target_keys, true)).toEqual(expected);
  });

  it("should handle nested objects correctly", () => {
    const nestedObj = {
      name: "John",
      details: { age: 30, school: "XYZ" },
      degree: "CS",
    };
    const target_keys = ["details"];
    const expected = { details: { age: 30, school: "XYZ" } };
    expect(extractFromObjBy(nestedObj, target_keys)).toEqual(expected);
  });

  it("should handle nested objects correctly when is_excluded is true", () => {
    const nestedObj = {
      name: "John",
      details: { age: 30, school: "XYZ" },
      degree: "CS",
    };
    const target_keys = ["details"];
    const expected = { name: "John", degree: "CS" };
    expect(extractFromObjBy(nestedObj, target_keys, true)).toEqual(expected);
  });

  it("should handle deeply nested objects with a complex structure", () => {
    const complexObj = {
      name: "John",
      details: {
        age: 30,
        education: [
          { school: "XYZ", degree: "CS" },
          { school: "ABC", degree: "Math" },
        ],
        work: [
          { company: "Company1", position: "Developer" },
          { company: "Company2", position: "Manager" },
        ],
      },
    };
    const target_keys = ["details"];
    const expected = {
      details: {
        age: 30,
        education: [
          { school: "XYZ", degree: "CS" },
          { school: "ABC", degree: "Math" },
        ],
        work: [
          { company: "Company1", position: "Developer" },
          { company: "Company2", position: "Manager" },
        ],
      },
    };
    expect(extractFromObjBy(complexObj, target_keys)).toEqual(expected);
  });

  it("should handle deeply nested objects with a complex structure when is_excluded is true", () => {
    const complexObj = {
      name: "John",
      details: {
        age: 30,
        education: [
          { school: "XYZ", degree: "CS" },
          { school: "ABC", degree: "Math" },
        ],
        work: [
          { company: "Company1", position: "Developer" },
          { company: "Company2", position: "Manager" },
        ],
      },
    };
    const target_keys = ["details"];
    const expected = { name: "John" };
    expect(extractFromObjBy(complexObj, target_keys, true)).toEqual(expected);
  });
});
