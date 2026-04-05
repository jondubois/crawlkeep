import { aggregateSample } from "../aggregate-sample.js";
import { isJsonArray, isEmptyArr } from "../../../check/index.js";
import { typeOf } from "../../../type-of.js";
import { jest, describe, test, it, expect, beforeEach } from "@jest/globals";

jest.mock("../../../check/index.js", () => ({
  isJsonArray: jest.fn(),
}));

jest.mock("../../../type-of.js", () => ({
  typeOf: jest.fn(),
}));

jest.mock("../../../check/modules/is-empty-arr.js", () => ({
  isEmptyArr: jest.fn(),
}));

describe("aggregateSample test suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("aggregates nested objects correctly", () => {
    const acc = {};
    const obj = {
      a: { b: { c: 1 } },
      d: { e: 2 },
    };
    typeOf.mockImplementation((input) => {
      if (input === obj || input === obj.a || input === obj.d) return "Object";
      return typeof input;
    });

    const result = aggregateSample(acc, obj);
    expect(result).toEqual({
      a: { b: { c: 1 } },
      d: { e: 2 },
    });
  });

  test("aggregates arrays of objects correctly", () => {
    const acc = {};
    const obj = {
      a: [{ b: 1 }, { c: 2 }],
    };
    isJsonArray.mockReturnValue(true);
    typeOf.mockReturnValue("Object");

    const result = aggregateSample(acc, obj);
    expect(result).toEqual({
      a: [{ b: 1, c: 2 }],
    });
  });

  // test("keeps only the first element of arrays of primitives", () => {
  //   const acc = {};
  //   const obj = {
  //     a: [1, 2, 3],
  //   };
  //   typeOf.mockReturnValue("Object");

  //   const result = aggregateSample(acc, obj);
  //   expect(result).toEqual({
  //     a: [1],
  //   });
  // });

  it("keeps only the first element of arrays of primitives", () => {
    const acc = {};
    const obj = {
      key1: [1, 2, 3],
      key2: [{ a: 1 }, { b: 2 }],
      key3: "string",
      key4: { nestedKey: "nestedValue" },
    };

    // Mock implementations
    isJsonArray.mockImplementation((arr) => {
      return !(
        isEmptyArr(arr) || !arr.every((item) => typeOf(item) === "Object")
      );
    });

    typeOf.mockImplementation((data) => {
      let data_type = typeof data;
      if (data_type !== "object") {
        return data_type;
      } else {
        if (data === null) {
          return "null";
        }
        return "Object"; // Simplified for the mock
      }
    });

    isEmptyArr.mockImplementation((arr) => {
      return !Array.isArray(arr) || !arr.length;
    });

    const result = aggregateSample(acc, obj);
    expect(result).toEqual({
      key1: [1],
      key2: [{ a: 1, b: 2 }],
      key3: "string",
      key4: { nestedKey: "nestedValue" },
    });
  });

  test("throws an error for non-object input", () => {
    const acc = {};
    const obj = "not an object";

    typeOf.mockReturnValue("String");

    expect(() => aggregateSample(acc, obj)).toThrow(
      "aggregateSample - Invalid input. Expected:\n      - [object Object] to be a keyed Object. Instead, got object\n      - not an object to be a keyed Object. Instead, got string",
    );
  });

  it("should correctly aggregate the sample data", () => {
    let input_arr = [
      {
        public_url: "https://www.linkedin.com/in/alexander-fakira-00348a42",
        first_name: "Alexander",
        can_send_inmail: true,
        network_distance: 3,
        jobs: [
          {
            job_start_timestamp: 284014800000,
            job_end_timestamp: 604731600000,
            company: [
              {
                employee_count_high: 5000,
                name: "Black Sea Shipping Company",
                id: "1368700",
              },
            ],
          },
          {
            job_start_timestamp: 284014800000,
            job_end_timestamp: 604731600000,
          },
          {
            job_start_timestamp: 28401480123,
            job_is_current: true,
            job_company_employee_count_high: 5000,
            job_company_employee_count_low: 1001,
          },
        ],
        edus: {
          edu_degree_name: "Diploma of Engineering",
          edu_end_year: 1979,
          edu_start_year: 1976,
        },
        twitters: ["dmitrikozlov", "twitterhandle"],
      },
      {
        profile_img:
          "https://media.licdn.com/dms/image/D5603AQEoceOA4CdVlA/profile-displayphoto-shrink_800_800/0/1709296663877?e=1715817600&v=beta&t=2dbeSILnKMEJ41oSaxQ6XxcyYgoe1D0pA7ZsRyI8T-o",
        certs: {
          cert_name: "Data Analyst",
          cert_start_timestamp: 1704085200000,
          cert_end_timestamp: 1710291574887,
        },
        number_of_connections: 267,
        member_id: "150477699",
        desired_employment_types: ["FULL_TIME", "CONTRACT", "PART_TIME"],
        jobs: [
          {
            job_start_timestamp: 284014800123,
            job_end_timestamp: 604731600456,
            company: [
              {
                hq_region: "Australia",
                follower_count: 14368,
                name: "Coomes Consulting Group (Spiire)",
                id: "769469",
              },
            ],
          },
          {
            job_start_timestamp: 284014800789,
            job_end_timestamp: 604731600147,
          },
          {
            job_start_timestamp: 28401480258,
            job_end_timestamp: 604731600369,
          },
        ],
      },
    ];

    let expected_output = {
      public_url: "https://www.linkedin.com/in/alexander-fakira-00348a42",
      first_name: "Alexander",
      can_send_inmail: true,
      network_distance: 3,
      jobs: [
        {
          job_start_timestamp: 28401480258,
          job_end_timestamp: 604731600369,
          company: [
            {
              employee_count_high: 5000,
              name: "Coomes Consulting Group (Spiire)",
              id: "769469",
              hq_region: "Australia",
              follower_count: 14368,
            },
          ],
          job_is_current: true,
          job_company_employee_count_high: 5000,
          job_company_employee_count_low: 1001,
        },
      ],
      edus: {
        edu_degree_name: "Diploma of Engineering",
        edu_end_year: 1979,
        edu_start_year: 1976,
      },
      twitters: ["dmitrikozlov"],
      profile_img:
        "https://media.licdn.com/dms/image/D5603AQEoceOA4CdVlA/profile-displayphoto-shrink_800_800/0/1709296663877?e=1715817600&v=beta&t=2dbeSILnKMEJ41oSaxQ6XxcyYgoe1D0pA7ZsRyI8T-o",
      certs: {
        cert_name: "Data Analyst",
        cert_start_timestamp: 1704085200000,
        cert_end_timestamp: 1710291574887,
      },
      number_of_connections: 267,
      member_id: "150477699",
      desired_employment_types: ["FULL_TIME"],
    };

    let result = input_arr.reduce((acc, obj) => aggregateSample(acc, obj), {});
    expect(result).toEqual(expected_output);
  });
});
