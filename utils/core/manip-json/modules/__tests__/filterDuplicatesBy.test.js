import {
  filterDuplicatesByMap,
  filterDuplicatesByMultiProps,
} from "../filter-duplicates-by.js";
import { describe, it, expect } from "@jest/globals";

describe("filterDuplicatesByMap", () => {
  it("should remove duplicates from an array of objects based on a property", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    const expectedOutput = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    expect(filterDuplicatesByMap(input, "id")).toEqual(expectedOutput);
  });

  it("should return the same array if there are no duplicates", () => {
    const input = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    const expectedOutput = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    expect(filterDuplicatesByMap(input, "id")).toEqual(expectedOutput);
  });

  it("should return an empty array if the input is an empty array", () => {
    const input = [];
    const expectedOutput = [];
    expect(filterDuplicatesByMap(input, "id")).toEqual(expectedOutput);
  });

  // Add more test cases as needed
});

/////////////////////////////////////////////////////////////////////////////////////////
describe("filterDuplicatesByMultiProps", () => {
  const people_ids = ["public_id", "lir_niid", "member_id"];
  it("should merge duplicates based on specified properties", () => {
    const input = [
      {
        public_id: "tejas-awasarmol",
        company_name: "Google",
      },
      {
        public_id: "tejas-awasarmol",
        lir_niid: "EMAACOJHmoBBE8LjIOZXm5aZNB-N9pdk_GnefM)",
      },
      {
        lir_niid: "EMAACOJHmoBBE8LjIOZXm5aZNB-N9pdk_GnefM)",
        member_id: "596188778",
      },
    ];

    const output = filterDuplicatesByMultiProps(input, people_ids);

    expect(output).toEqual([
      {
        public_id: "tejas-awasarmol",
        lir_niid: "EMAACOJHmoBBE8LjIOZXm5aZNB-N9pdk_GnefM)",
        member_id: "596188778",
        company_name: "Google",
      },
    ]);
  });
  it("should merge properties", () => {
    const input = [
      {
        public_id: "tejas-awasarmol",
        company_name: "Google",
      },
      {
        public_id: "tejas-awasarmol",
        first_name: "Jo",
      },
      {
        public_id: "tejas-awasarmol",
        last_name: "Smith",
      },
    ];

    const output = filterDuplicatesByMultiProps(input, people_ids);

    expect(output).toEqual([
      {
        public_id: "tejas-awasarmol",
        first_name: "Jo",
        last_name: "Smith",
        company_name: "Google",
      },
    ]);
  });
});
