import { aggregateBatchBy } from "../aggregate-batch-by.js";
import { describe, it, expect } from "@jest/globals";

describe("aggregateBatchBy", () => {
  it("should correctly aggregate batches", () => {
    const json_arr = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "Doe" },
      { id: 4, name: "Smith" },
      { id: 5, name: "Brown" },
    ];
    const max_size = 100; // adjust this value based on your requirements

    const result = aggregateBatchBy(json_arr, max_size);

    // Check that the result is an array
    expect(Array.isArray(result)).toBe(true);

    // Check that each batch is not larger than max_size
    result.forEach((batch) => {
      const size = Buffer.byteLength(JSON.stringify(batch), "utf-8");
      expect(size).toBeLessThanOrEqual(max_size);
    });

    // Check that all objects from json_arr are in the result
    const allObjects = result.flat();
    expect(allObjects).toEqual(expect.arrayContaining(json_arr));
  });
});
