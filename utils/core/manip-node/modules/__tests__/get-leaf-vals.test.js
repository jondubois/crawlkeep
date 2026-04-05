import { getLeafVals } from "../get-leaf.js";
import { describe, test, expect } from "@jest/globals";

describe("getLeafVals", () => {
  test("should throw an error for invalid node input", () => {
    expect(() => getLeafVals(null, {})).toThrow(
      "getLeafVals - Invalid input. Expected:",
    );
  });

  test("should throw an error for invalid mask input", () => {
    expect(() => getLeafVals({}, null)).toThrow(
      "getLeafVals - Invalid input. Expected:",
    );
  });

  test("should return an empty array for empty node or mask", () => {
    expect(getLeafVals({}, {})).toEqual([]);
    expect(getLeafVals({ a: 1 }, {})).toEqual([]);
    expect(getLeafVals({}, { a: 1 })).toEqual([]);
  });

  test("should return an empty array if mask keys do not match node keys", () => {
    const node = { a: 1, b: 2 };
    const mask = { c: 0 };
    expect(getLeafVals(node, mask)).toEqual([]);
  });

  test("Non-matching properties in `node` and `mask`", () => {
    const leafNodeVals = getLeafVals(
      { name: "John", age: 25 },
      { name: "John", gender: "Male" },
    );
    expect(leafNodeVals).toEqual([]);
  });

  test("Matching properties in `node` and `mask`", () => {
    const leafNodeVals = getLeafVals(
      { name: "John", age: 25 },
      { name: "John", age: 25 },
    );
    expect(leafNodeVals).toEqual(["John", 25]);
  });

  test("Nested objects with matching properties", () => {
    const srcNode = {
      name: "John",
      age: 25,
      children: [
        {
          Alice: {
            address: {
              city: "New York",
              country: "USA",
            },
          },
        },
        {
          Kevin: {
            address: {
              city: "Sydney",
              country: "AU",
            },
            skills: ["JavaScript", "React", "Node.js"],
          },
        },
        {
          Kevin: {
            address: {
              city: "Melbourne",
              country: "USA",
            },
            skills: ["Docker", "Angular", "CSS"],
          },
        },
      ],
    };
    const maskNode = {
      name: "string",
      children: [
        {
          Kevin: {
            skills: ["string"],
          },
        },
      ],
    };
    const leafNodeVals = getLeafVals(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
      ["JavaScript", "React", "Node.js"],
      ["Docker", "Angular", "CSS"],
    ]);
  });

  test("should capture values of leaf nodes that match the mask", () => {
    const node = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4,
        },
      },
    };
    const mask = {
      b: {
        d: {
          e: 0,
        },
      },
    };
    expect(getLeafVals(node, mask)).toEqual([3]);
  });

  test("should handle arrays in the node structure", () => {
    const node = {
      a: [{ b: 1 }, { b: 2 }],
    };
    const mask = {
      a: [{ b: 0 }],
    };
    expect(getLeafVals(node, mask)).toEqual([1, 2]);
  });

  // test("should handle nested arrays in the node structure", () => {
  //   const node = {
  //     a: [{ b: [1, 2] }, { b: [3, 4] }],
  //   };
  //   const mask = {
  //     a: [{ b: [0] }],
  //   };
  //   expect(getLeafVals(node, mask)).toEqual([1, 2, 3, 4]);
  // });

  test("Nested object with matching properties", () => {
    const srcNode = {
      name: "John",
      age: 25,
      address: {
        city: "New York",
        country: "USA",
      },
    };
    const maskNode = {
      name: "string",
      address: {
        city: "string",
      },
    };
    const leafNodeVals = getLeafVals(srcNode, maskNode);
    expect(leafNodeVals).toEqual(["New York"]);
  });

  test("Array of objects with matching properties", () => {
    const srcNode = [
      { name: "John", age: 25 },
      { name: "Jane", age: 30 },
      { name: "Bob", age: 40 },
    ];
    const maskNode = { age: 0 };
    const leafNodeVals = srcNode.map((node) => getLeafVals(node, maskNode));
    expect(leafNodeVals).toEqual([[25], [30], [40]]);
  });

  test("Array of objects with non-matching properties", () => {
    const srcNode = [
      { name: "John", age: 25 },
      { name: "Jane", age: 30 },
      { name: "Bob", age: 40 },
    ];
    const maskNode = { gender: "Male" };
    const leafNodeVals = srcNode.map((node) => getLeafVals(node, maskNode));
    expect(leafNodeVals).toEqual([[], [], []]);
  });

  test("Array of objects with nested objects and matching properties", () => {
    const srcNode = [
      { name: "John", age: 25, address: { city: "New York" } },
      { name: "Jane", age: 30, address: { city: "Los Angeles" } },
      { name: "Bob", age: 40, address: { city: "New York" } },
    ];
    const maskNode = { address: { city: "string" } };
    const leafNodeVals = srcNode.map((node) => getLeafVals(node, maskNode));
    expect(leafNodeVals).toEqual([["New York"], ["Los Angeles"], ["New York"]]);
  });

  test("Nested Object with Array as leaf node matching `mask`", () => {
    const srcNode = {
      public_url: "https://www.linkedin.com/in/shaymaa-kadhim-9b6846137",
      first_name: "Shaymaa",
      last_name: "Kadhim",
      headline: "master of computers   systems  and Networking    engineering",
      can_send_inmail: true,
      privacy_allows_connections_browse: true,
      country: "Australia",
      state: "New South Wales",
      city: "Sydney Olympic Park",
      location: "Sydney Olympic Park, New South Wales, Australia",
      public_id: "shaymaa-kadhim-9b6846137",
      lir_niid: "EMAACFoAhoBKyLbK1wG5WkiaVBCPGZvMBMtrEk)",
      industry: "Retail",
      network_distance: 2,
      jobs: [
        {
          job_start_timestamp: 1706763600000,
          job_end_timestamp: 1710563792942,
          millseconds_in_job: 3800192942,
          job_is_current: true,
          job_company_employee_count_low: 10001,
          job_company_linkedin_url: "https://www.linkedin.com/company/3277",
          job_company_description:
            "Our vision is to help make Queensland a safe and secure place to live, visit and do business. Our purpose is to deliver quality policing services 24 hours a day. During more than 130 years of its history, the traditions of the Queensland Police Service have been shaped by immense social changes, incredible advances in technology and the continual evolution of operational procedures and staff attitudes toward their role and community cooperation. Do not use this page to report a crime. In an emergency, contact Triple Zero (000). For non-urgent matters, contact Policelink on 131 444 or https://www.police.qld.gov.au/programs/policelink Your use of the Queensland Police Service LinkedIn Page is subject to the terms of use of LinkedIn and the following terms, except where otherwise stated: 1. You may use all material posted by the Queensland Police Service, except trademarks, on this page under the Creative Commons Attribution 4.0 Licence 2. Material posted by a Facebook user to this Page is deemed to be made available by that person under the Creative Commons Attribution 4.0 licence. 3. Attribution for the Queensland Police Service is requested as ‘State of Queensland (Queensland Police Service) 2018’, and for user content on this page, please attribute their username. ",
          job_company_hq_region: "Australia",
          job_company_follower_count: 41481,
          job_employment_status: "Full-time",
          job_company_name: "Queensland Police Service",
          job_company_id: "3277",
          job_title: "Software Engineer",
          job_industries: ["Law Enforcement"],
        },
        {
          job_start_timestamp: 1672549200000,
          job_end_timestamp: 1710563792942,
          millseconds_in_job: 38014592942,
          job_is_current: true,
          job_company_employee_count_low: 10001,
          job_company_linkedin_url: "https://www.linkedin.com/company/3274",
          job_company_description:
            "We are the largest and most diverse organisation in our state. We have more than 90 government departments and organisations providing essential services across 4000+ locations—from the Torres Strait to the Gold Coast; Mount Isa to Brisbane. We are passionate about making Queensland better through what we do and supporting our employees to create the career and life that is right for them. This page is monitored by Queensland Government employees from 8am to 5pm, Monday to Friday. HOUSE RULES We encourage open dialogue, but request that you are respectful of other users and their opinions. By connecting with this Queensland Government LinkedIn page, we ask you to keep in mind the following: — all users must comply with LinkedIn policies and terms of use — please do not post content or comments that could be considered • abusive or obscene, name calling, harassment or personal attacks • defamatory towards a person or people • prejudicial, inflammatory or offensive • deceptive, misleading or false information about an individual, organisation, government or entity • personal or sensitive information about yourself or others • in violation of any intellectual property rights, or any other law or regulation • promotion of a product, business, company or organisation • off-topic or spam, including the same comment posted repeatedly. Any content or comments deemed to fit under these definitions will be deleted. Users found to repeatedly post these types of comments will be banned from this page. You should report any offensive material presented on LinkedIn. Complaints about anything you consider to be offensive should be made directly to LinkedIn. CURRENT CONDITIONS © The State of Queensland (Public Sector Commission) 2024 Subject to LinkedIn’s Statement of Rights and Responsibilities, all content released on this page is licensed under a Creative Commons Attribution (BY) 2.5 Australia Licence. Permissions may be available beyond the scope of this licence.",
          job_company_hq_region: "Australia",
          job_company_follower_count: 122106,
          job_employment_status: "Full-time",
          job_company_name: "Queensland Government",
          job_company_id: "3274",
          job_title: "Information Technology System Engineer",
          job_industries: ["Government Administration"],
          job_country: "au",
          job_display_location: "Brisbane City, Queensland, Australia",
        },
        {
          job_start_timestamp: 1675227600000,
          job_end_timestamp: 1710563792942,
          millseconds_in_job: 35336192942,
          job_is_current: true,
          job_company_employee_count_low: 10001,
          job_company_linkedin_url: "https://www.linkedin.com/company/3274",
          job_company_description:
            "We are the largest and most diverse organisation in our state. We have more than 90 government departments and organisations providing essential services across 4000+ locations—from the Torres Strait to the Gold Coast; Mount Isa to Brisbane. We are passionate about making Queensland better through what we do and supporting our employees to create the career and life that is right for them. This page is monitored by Queensland Government employees from 8am to 5pm, Monday to Friday. HOUSE RULES We encourage open dialogue, but request that you are respectful of other users and their opinions. By connecting with this Queensland Government LinkedIn page, we ask you to keep in mind the following: — all users must comply with LinkedIn policies and terms of use — please do not post content or comments that could be considered • abusive or obscene, name calling, harassment or personal attacks • defamatory towards a person or people • prejudicial, inflammatory or offensive • deceptive, misleading or false information about an individual, organisation, government or entity • personal or sensitive information about yourself or others • in violation of any intellectual property rights, or any other law or regulation • promotion of a product, business, company or organisation • off-topic or spam, including the same comment posted repeatedly. Any content or comments deemed to fit under these definitions will be deleted. Users found to repeatedly post these types of comments will be banned from this page. You should report any offensive material presented on LinkedIn. Complaints about anything you consider to be offensive should be made directly to LinkedIn. CURRENT CONDITIONS © The State of Queensland (Public Sector Commission) 2024 Subject to LinkedIn’s Statement of Rights and Responsibilities, all content released on this page is licensed under a Creative Commons Attribution (BY) 2.5 Australia Licence. Permissions may be available beyond the scope of this licence.",
          job_company_hq_region: "Australia",
          job_company_follower_count: 122106,
          job_employment_status: "Full-time",
          job_company_name: "Queensland Government",
          job_company_id: "3274",
          job_title: "Research Assistant",
          job_industries: ["Government Administration"],
          job_country: "au",
          job_display_location: "Brisbane, Queensland, Australia",
        },
      ],
      edus: [
        {
          edu_field_of_study: "computer systems engineering ",
          edu_school_id: "10249",
          edu_school_name: "University of Southern Queensland",
          edu_institution_name: "University of Southern Queensland",
          edu_end_year: 2020,
          edu_start_year: 2017,
        },
      ],
      profile_img:
        "https://media.licdn.com/dms/image/C5603AQFqCnG19Xhf4Q/profile-displayphoto-shrink_800_800/0/1659341943365?e=1715817600&v=beta&t=zVaigKRHw59uXuwqGEXmXFlQ8yprfiICz6jfdwG4MPQ",
      previous_locations: [
        "Brisbane City, Queensland, Australia",
        "Brisbane, Queensland, Australia",
      ],
      number_of_connections: 556,
      ts_hire_identity: "560464410",
      member_id: "560464410",
      companies_following: [
        {
          follower_count: 16137546,
          company_url: "https://www.linkedin.com/recruiter/company/1009",
          company_name: "IBM",
        },
        {
          follower_count: 4912407,
          company_url: "https://www.linkedin.com/recruiter/company/1015",
          company_name: "GE",
        },
      ],
      skills: [
        "Root Cause Analysis",
        "Software Testing",
        "Software Testing Life Cycle (STLC)",
        "Teamwork",
        "Kaizen",
        "Communication",
        "Team Leadership",
        "Problem Solving",
        "Project Planning",
        "Project Management",
        "Engineering",
        "Computer Software Training",
      ],
    };
    const maskNode = { jobs: [{ job_industries: ["string"] }] };
    const leafNodeVals = getLeafVals(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
      ["Law Enforcement"],
      ["Government Administration"],
      ["Government Administration"],
    ]);
  });
});
