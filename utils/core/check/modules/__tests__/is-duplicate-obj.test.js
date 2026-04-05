import { isDuplicateObj } from "../is-duplicate-obj.js";
import { describe, beforeEach, it, expect } from "@jest/globals";

describe("isDuplicateObj", () => {
  let uniq_set;
  beforeEach(() => {
    uniq_set = new Set();
  });
  let props = ["public_id", "lir_niid", "member_id"];

  it("should return true for duplicate objects", () => {
    const obj1 = {
      public_id: "public_id1",
      lir_niid: "lir_niid1",
      name: "Kev",
    };
    const obj2 = {
      lir_niid: "lir_niid1",
      member_id: "member_id1",
      name: "Kev",
    };

    expect(isDuplicateObj(obj1, uniq_set, props)).toBe(false);
    expect(isDuplicateObj(obj2, uniq_set, props)).toBe(true);
    expect(uniq_set.size).toBe(1); // Check that the set size has increased
  });

  it("should return false for unique objects", () => {
    const obj1 = {
      public_id: "public_id1",
      lir_niid: "lir_niid1",
      name: "Kev",
    };
    const obj2 = {
      lir_niid: "lir_niid2",
      member_id: "member_id2",
      name: "Andre",
    };
    const obj3 = { public_id: "public_id3", member_id: "member_id3", age: 30 };

    expect(isDuplicateObj(obj1, uniq_set, props)).toBe(false);
    expect(isDuplicateObj(obj2, uniq_set, props)).toBe(false);
    expect(isDuplicateObj(obj3, uniq_set, props)).toBe(false);
    expect(uniq_set.size).toBe(3); // Check that the set size has increased
  });

  it("should handle empty objects", () => {
    const obj = {};
    expect(isDuplicateObj(obj, uniq_set, props)).toBe(false);
    expect(uniq_set.size).toBe(0); // Check that the set size hasn't increased
  });

  it("should handle objects with missing properties", () => {
    const obj1 = { id: 1 };
    const obj2 = { name: "John" };

    isDuplicateObj(obj1, uniq_set, props);
    expect(isDuplicateObj(obj2, uniq_set, props)).toBe(false);
    expect(uniq_set.size).toBe(0); // Check that the set size has increased
  });

  it("should handle objects that share one property in common, but this property is not the same between pairs", () => {
    const obj1 = {
      public_id: "public_id1",
      lir_niid: "lir_niid1",
      name: "Kev",
    };
    const obj2 = {
      lir_niid: "lir_niid1",
      member_id: "member_id1",
      name: "Kev",
    };
    const obj3 = {
      public_id: "public_id2",
      member_id: "member_id2",
      name: "Andre",
    };

    expect(isDuplicateObj(obj1, uniq_set, props)).toBe(false);
    expect(isDuplicateObj(obj2, uniq_set, props)).toBe(true); // obj2 shares properties with obj1
    expect(isDuplicateObj(obj3, uniq_set, props)).toBe(false); // obj3 is unique

    const expectedSet = new Set();
    expectedSet.add(
      JSON.stringify({
        public_id: "public_id1",
        lir_niid: "lir_niid1",
        member_id: "member_id1",
      }),
    );
    expectedSet.add(
      JSON.stringify({ public_id: "public_id2", member_id: "member_id2" }),
    );

    const uniq_set_arr = Array.from(uniq_set.keys()).map(JSON.stringify).sort();
    const expectedSet_arr = Array.from(expectedSet.keys()).sort();

    expect(uniq_set_arr).toEqual(expectedSet_arr);
    expect(uniq_set.size).toBe(2); // Check that the set size has increased
  });
});
