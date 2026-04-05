import { mergeTargetWithSourceBy } from "../../../manip-json/modules/reduce-json-array-by.js";
import { isEmptyArr } from "../../../check/modules/is-empty-arr.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../check/modules/is-empty-arr.js");

describe("mergeTargetWithSourceBy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw TypeError for invalid target input", () => {
    expect(() => mergeTargetWithSourceBy(null, [], "id")).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy({}, [], "id")).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy("string", [], "id")).toThrow(
      TypeError,
    );
  });

  test("should throw TypeError for invalid source input", () => {
    expect(() => mergeTargetWithSourceBy([], null, "id")).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy([], {}, "id")).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy([], "string", "id")).toThrow(
      TypeError,
    );
  });

  test("should throw TypeError for invalid common_key input", () => {
    expect(() => mergeTargetWithSourceBy([], [], null)).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy([], [], {})).toThrow(TypeError);
    expect(() => mergeTargetWithSourceBy([], [], 123)).toThrow(TypeError);
  });

  test("should return target if both arrays are empty", () => {
    isEmptyArr.mockReturnValueOnce(true).mockReturnValueOnce(true);
    const target = [];
    const source = [];
    expect(mergeTargetWithSourceBy(target, source, "id")).toEqual(target);
  });

  test("should return target if source is empty", () => {
    isEmptyArr.mockReturnValueOnce(false).mockReturnValueOnce(true);
    const target = [{ id: 1, name: "target" }];
    const source = [];
    expect(mergeTargetWithSourceBy(target, source, "id")).toEqual(target);
  });

  test("should merge target and source by common key", () => {
    isEmptyArr.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const target = [{ id: 1, name: "target" }];
    const source = [{ id: 1, value: "source" }];
    const expected = [{ id: 1, name: "target", value: "source" }];
    expect(mergeTargetWithSourceBy(target, source, "id")).toEqual(expected);
  });

  test("should not merge if common key does not match", () => {
    isEmptyArr.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const target = [{ id: 1, name: "target" }];
    const source = [{ id: 2, value: "source" }];
    const expected = [{ id: 1, name: "target" }];
    expect(mergeTargetWithSourceBy(target, source, "id")).toEqual(expected);
  });

  test("should handle multiple objects in target and source", () => {
    isEmptyArr.mockReturnValueOnce(false).mockReturnValueOnce(false);
    const target = [
      { id: 1, name: "target1" },
      { id: 2, name: "target2" },
    ];
    const source = [
      { id: 1, value: "source1" },
      { id: 2, value: "source2" },
    ];
    const expected = [
      { id: 1, name: "target1", value: "source1" },
      { id: 2, name: "target2", value: "source2" },
    ];
    expect(mergeTargetWithSourceBy(target, source, "id")).toEqual(expected);
  });
});
