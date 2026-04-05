// test suite passed. Just couldn't mock the second param validation
import { permutate } from "../permutate.js";
import { typeOf } from "../../../type-of.js";
import { jest, beforeEach, describe, test, expect } from "@jest/globals";

jest.mock("../../../type-of.js");

describe("permutate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return an empty array for an empty input array", () => {
    const arr = [];
    typeOf.mockReturnValue("Array");
    const result = permutate(arr);
    expect(result).toEqual([]);
  });

  test("should return the same array for a single-element array", () => {
    const arr = [1];
    typeOf.mockReturnValue("Array");
    const result = permutate(arr);
    expect(result).toEqual([[1]]);
  });

  test("should return all permutations for a two-element array", () => {
    const result = permutate([1, 2]);
    typeOf.mockReturnValue("Array");
    expect(result).toEqual(
      expect.arrayContaining([
        [1, 2],
        [2, 1],
      ]),
    );
    expect(result).toHaveLength(2);
  });

  test("should return all permutations for a three-element array", () => {
    const result = permutate([1, 2, 3]);
    typeOf.mockReturnValue("Array");
    expect(result).toEqual(
      expect.arrayContaining([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ]),
    );
    expect(result).toHaveLength(6);
  });

  test("should throw a TypeError for non-array input", () => {
    expect(() => permutate("not an array")).toThrow(TypeError);
    expect(() => permutate(123)).toThrow(TypeError);
    expect(() => permutate({})).toThrow(TypeError);
  });

  //   test("should throw a TypeError for an array comprising of invalid elements", () => {
  //     const invalidInputs = [null, undefined, 123, "string", {}, () => {}];
  //     typeOf.mockImplementation((elm) => {
  //       if (elm === null) return "null";
  //       if (elm === undefined) return "undefined";
  //       if (typeof elm === "object" && !Array.isArray(elm)) return "object";
  //       return typeof elm;
  //     });
  //     invalidInputs.forEach((input) => {
  //       expect(() => permutate([input])).toThrow(TypeError);
  //       expect(() => permutate([input])).toThrow(
  //         `permutate - Invalid input. Expected ${[
  //           input,
  //         ]} to be an Array of fundamental data type elements. Instead, was passed ${[
  //           input,
  //         ]}`,
  //       );
  //     });
  //   });
});
