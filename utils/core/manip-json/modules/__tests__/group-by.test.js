import { groupBy0 } from "../group-by.js";
import { describe, it, expect } from "@jest/globals";
import jest from "jest";

describe("groupBy0", () => {
  it("should group items by the given key", () => {
    const items = [
      { category: "fruits", name: "apple" },
      { category: "vegetables", name: "carrot" },
      { category: "fruits", name: "banana" },
    ];
    const grouped = groupBy0(items, (item) => item.category);
    expect(grouped).toEqual({
      fruits: [
        { category: "fruits", name: "apple" },
        { category: "fruits", name: "banana" },
      ],
      vegetables: [{ category: "vegetables", name: "carrot" }],
    });
  });

  it("should return an empty object for an empty array", () => {
    const grouped = groupBy0([], () => {});
    expect(grouped).toEqual({});
  });

  it("should handle items without the key", () => {
    const items = [
      { category: "fruits", name: "apple" },
      { name: "carrot" }, // Missing category
      { category: "fruits", name: "banana" },
    ];
    const grouped = groupBy0(items, (item) => item.category);
    expect(grouped).toHaveProperty("fruits");
    expect(grouped).toHaveProperty("undefined");
    expect(grouped["undefined"]).toEqual([{ name: "carrot" }]);
  });

  it("should use the provided keyGetter function correctly", () => {
    const items = [
      { category: "fruits", name: "apple" },
      { category: "vegetables", name: "carrot" },
      { category: "fruits", name: "banana" },
    ];
    const keyGetter = jest.fn((item) => item.category);
    expect(keyGetter).toHaveBeenCalledTimes(items.length);
  });
});
