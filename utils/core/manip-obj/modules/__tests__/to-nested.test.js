import { toNested5, toNestedHelper } from "../to-nested.js";
import { describe, it, test, expect } from "@jest/globals";

describe("toNested5", () => {
  test("should throw TypeError for invalid inputs", () => {
    expect(() => toNested5(null, [])).toThrow(TypeError);
    expect(() => toNested5({}, null)).toThrow(TypeError);
    expect(() => toNested5([], [])).toThrow(TypeError);
  });

  test("should return the same object if empty object or patterns", () => {
    expect(toNested5({}, [])).toEqual({});
    expect(toNested5({ a: 1 }, [])).toEqual({ a: 1 });
  });

  test("should convert flat object to nested object based on patterns", () => {
    const obj = {
      user_name: "John",
      user_age: 30,
      address_city: "New York",
      address_zip: "10001",
    };
    const patterns = [
      "^(?<category_name>user)_(?<property_name>.+)$",
      "^(?<category_name>address)_(?<property_name>.+)$",
    ];
    const expected = {
      user: {
        user_name: "John",
        user_age: 30,
      },
      address: {
        address_city: "New York",
        address_zip: "10001",
      },
    };
    expect(toNested5(obj, patterns)).toEqual(expected);
  });
});

describe("toNestedHelper", () => {
  test("should throw TypeError for invalid inputs", () => {
    expect(() => toNestedHelper(null, [])).toThrow(TypeError);
    expect(() => toNestedHelper({}, null)).toThrow(TypeError);
    expect(() => toNestedHelper([], [])).toThrow(TypeError);
  });

  test("should return the same object if empty object or patterns", () => {
    expect(toNestedHelper({}, [])).toEqual({});
    expect(toNestedHelper({ a: 1 }, [])).toEqual({ a: 1 });
  });

  test("should convert flat object to nested object based on patterns", () => {
    const obj = {
      user_name: "John",
      user_age: 30,
      address_city: "New York",
      address_zip: "10001",
    };
    const patterns = [
      "^(?<category_name>user)_(?<property_name>.+)$",
      "^(?<category_name>address)_(?<property_name>.+)$",
    ];
    const expected = {
      user: {
        user_name: "John",
        user_age: 30,
      },
      address: {
        address_city: "New York",
        address_zip: "10001",
      },
    };
    expect(toNestedHelper(obj, patterns)).toEqual(expected);
  });

  it("should return the correct output for given input", () => {
    const input = {
      VW_2_color: "red",
      VW_2_gear: "automatic",
      VW_1_color: "blue",
    };
    const patterns = [
      "^(?<category_name>\\w+)_(?<index>\\d+).+\\k<category_name>_(?<property_name>\\w+)$",
      "^(?<category_name>\\w+)_(?<index>\\d+)_(?<property_name>\\w+)$",
    ];
    const expectedOutput = {
      VW: [{ VW_color: "blue" }, { VW_color: "red", VW_gear: "automatic" }],
    };
    expect(toNestedHelper(input, patterns)).toEqual(expectedOutput);
  });

  it("should return an empty object for an empty input", () => {
    const input = {};
    const patterns = [
      "^(?<category_name>\\w+)_(?<index>\\d+).+\\k<category_name>_(?<property_name>\\w+)$",
      "^(?<category_name>\\w+)_(?<index>\\d+)_(?<property_name>\\w+)$",
    ];
    const expectedOutput = {};
    expect(toNestedHelper(input, patterns)).toEqual(expectedOutput);
  });

  it("should return the input object for an empty patterns Array", () => {
    const input = {
      VW_2_color: "red",
      VW_2_gear: "automatic",
      VW_1_color: "blue",
    };
    const patterns = [];
    const expectedOutput = {
      VW_2_color: "red",
      VW_2_gear: "automatic",
      VW_1_color: "blue",
    };
    expect(toNestedHelper(input, patterns)).toEqual(expectedOutput);
  });
});
