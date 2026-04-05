import { getInternalNode } from "../get-leaf.js";
import { describe, test, expect } from "@jest/globals";

describe("getInternalNode", () => {
  test("should throw TypeError for invalid input", () => {
    expect(() => getInternalNode(null, {})).toThrow(TypeError);
    expect(() => getInternalNode({}, null)).toThrow(TypeError);
    expect(() => getInternalNode([], {})).toThrow(TypeError);
    expect(() => getInternalNode({}, [])).toThrow(TypeError);
  });

  test("should return an array containing the root node, for empty root node", () => {
    const root_node = {};
    expect(
      getInternalNode(root_node, { example_key: "example value" }),
    ).toEqual([root_node]);
  });

  test("should return an array containing the root node, for empty mask object", () => {
    const root_node = { example_key: "example value" };
    expect(getInternalNode(root_node, {})).toEqual([root_node]);
  });

  test("should return an array containing the root node, for empty root node and mask", () => {
    const root_node = {};
    expect(getInternalNodernalNodernalNode(root_node, {})).toEqual([root_node]);
  });

  test("should handle basic case: a root node, matching `mask` with an empty array for value as a leaf node", () => {
    const node = {
      key1: [{ key2: "value2" }, { key2: "value3" }],
    };
    const mask = {
      key1: [],
    };
    expect(getInternalNode(node, mask)).toEqual([
      {
        key1: [{ key2: "value2" }, { key2: "value3" }],
      },
    ]);
  });

  test("should handle basic case: a root node, matching `mask` with an empty object value as a leaf node", () => {
    const node = {
      key1: {
        key2: "value2",
        key3: "value3",
      },
    };
    const mask = {
      key1: {},
    };
    expect(getInternalNode(node, mask)).toEqual([
      {
        key2: "value2",
        key3: "value3",
      },
    ]);
  });

  test("should handle basic case: a root node, matching `mask` with an empty primitive value as a leaf node", () => {
    const node = {
      key1: "value1",
      key2: "value2",
    };
    const mask = {
      key1: "",
    };
    expect(getInternalNode(node, mask)).toEqual([
      { key1: "value1", key2: "value2" },
    ]);
  });

  test("should return an empty array for a root node not matching `mask` ", () => {
    const leafNodeVals = getInternalNode(
      { name: "John", age: 25 },
      { name: "John", gender: "Male" },
    );
    expect(leafNodeVals).toEqual([]);
  });

  test("should return an array of empty arrays for an array of root nodes, not matching `mask` ", () => {
    const srcNodes = [
      { name: "John", age: 25 },
      { name: "Jane", age: 30 },
      { name: "Bob", age: 40 },
    ];
    const maskNode = { gender: "Male" };
    const leafNodeVals = srcNodes.map((node) =>
      getInternalNode(node, maskNode),
    );
    expect(leafNodeVals).toEqual([[], [], []]);
  });

  test("should return the correct target (in this case, a property) for a root node matching `mask` ", () => {
    const leafNodeVals = getInternalNode(
      { name: "John", age: 25 },
      { name: "string", age: 0 },
    );
    expect(leafNodeVals).toEqual([{ name: "John", age: 25 }]);
  });

  test("should handle an array of root nodes, matching `mask`", () => {
    const srcNodes = [
      { name: "John", age: 25, gender: "Male" },
      { name: "Jane", age: 30, gender: "Female" },
      { name: "Bob", age: 40, gender: "Male" },
    ];
    const maskNode = { gender: "string" };

    const result = srcNodes.flatMap((node) => getInternalNode(node, maskNode));
    const expected = [
      { name: "John", age: 25, gender: "Male" },
      { name: "Jane", age: 30, gender: "Female" },
      { name: "Bob", age: 40, gender: "Male" },
    ];

    expect(result).toEqual(expected);
  });

  test("should handle array of objects, matching `mask` with a primitive for value as a leaf node", () => {
    const srcNodes = [
      { name: "John", age: 25, gender: "Male" },
      { name: "Jane", age: 30, gender: 13 },
      { name: "Bob", age: 40, gender: "Male" },
    ];
    const maskNode = { gender: "string" };
    const leafNodeVals = srcNodes.flatMap((node) =>
      getInternalNode(node, maskNode),
    );
    const expected = [
      { name: "John", age: 25, gender: "Male" },
      { name: "Bob", age: 40, gender: "Male" },
    ];
    expect(leafNodeVals).toEqual(expected);
  });

  test("should handle nested arrays of keyed objects, matching `mask` with an array of primitive for value as a leaf node", () => {
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
    const leafNodeVals = getInternalNode(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
      {
        address: {
          city: "Sydney",
          country: "AU",
        },
        skills: ["JavaScript", "React", "Node.js"],
      },
      {
        address: {
          city: "Melbourne",
          country: "USA",
        },
        skills: ["Docker", "Angular", "CSS"],
      },
    ]);
  });

  test("should handle nested arrays of keyed objects, matching `mask` with a keyed object of primitive for value as a leaf node", () => {
    const node = { nested: [{ key: "value" }] };
    const mask = { nested: [{ key: "value" }] };

    const leafNodeVals = getInternalNode(node, mask);
    const expectedResult = [{ key: "value" }];

    expect(leafNodeVals).toEqual(expectedResult);
  });

  test("should handle a nested root node, matching `mask` with a primitive for value as a leaf node", () => {
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

    const expectedOutput = [
      {
        city: "New York",
        country: "USA",
      },
    ];

    const result = getInternalNode(srcNode, maskNode);
    expect(result).toEqual(expectedOutput);
  });

  test("should handle a root node, matching `mask` with a nested array of keyed objects with an identical key as a leaf node", () => {
    const node = {
      key1: [{ key2: "value2" }, { key2: "value3" }],
    };
    const mask = {
      key1: [{ key2: "" }],
    };
    expect(getInternalNode(node, mask)).toEqual([
      { key2: "value2" },
      { key2: "value3" },
    ]);
  });

  test("should handle nested keyed objects, matching `mask`", () => {
    const node = { nested: { key: "value" } };
    const mask = { nested: { key: "value" } };
    expect(getInternalNode(node, mask)).toEqual([{ key: "value" }]);
  });

  // test("should handle nested arrays in the node structure", () => {
  //   const node = {
  //     a: [{ b: [1, 2] }, { b: [3, 4] }],
  //   };
  //   const mask = {
  //     a: [{ b: [0] }],
  //   };
  //   expect(getInternalNode(node, mask)).toEqual([1, 2, 3, 4]);
  // });

  test("should handle a nested root node, matching `mask`'s keys and data type of values, with a primitive for value as a leaf node", () => {
    const srcNode = {
      name: "John",
      age: 25,
      address: {
        city: "Manhattan",
        country: "USA",
      },
    };
    const maskNode = {
      name: "string",
      address: {
        city: "string",
      },
    };
    const leafNodeVals = getInternalNode(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
      {
        city: "Manhattan",
        country: "USA",
      },
    ]);
  });

  test("should handle the case where the data type of the value is not matching `mask` along the chain", () => {
    const srcNodes = [
      {
        name: { first_name: "John" },
        age: 25,
        address: {
          city: "New-York",
          country: "USA",
        },
      },
      {
        name: "John",
        age: 25,
        address: {
          city: "Manhattan",
          country: "USA",
        },
      },
    ];
    const maskNode = {
      name: "string",
      address: {
        city: "string",
      },
    };
    const leafNodeVals = srcNodes.flatMap((node) =>
      getInternalNode(node, maskNode),
    );
    expect(leafNodeVals).toEqual([
      {
        city: "Manhattan",
        country: "USA",
      },
    ]);
  });

  test("should handle a nested root node, matching `mask`'s keys and data type of values, with an empty Array for value as a leaf node", () => {
    const srcNode = {
      name: "John",
      age: 25,
      address: {
        city: ["New York", "Dallas"],
        country: "USA",
      },
    };
    const maskNode = {
      name: "string",
      address: {
        city: [],
      },
    };
    const leafNodeVals = getInternalNode(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
      {
        city: ["New York", "Dallas"],
        country: "USA",
      },
    ]);
  });

  test("should handle an array of root nodes with nested keyed objects, matching `mask` with a primitive for value as a leaf node", () => {
    const srcNode = [
      { name: "Bob", age: 40, address: { city: 40 } },
      { name: "John", age: 25, address: { city: "New York" } },
      { name: "Jane", age: 30, address: { city: "Los Angeles" } },
    ];
    const maskNode = { address: { city: "string" } };
    const leafNodeVals = srcNode.map((node) => getInternalNode(node, maskNode));
    expect(leafNodeVals).toEqual([
      [],
      [
        {
          city: "New York",
        },
      ],
      [
        {
          city: "Los Angeles",
        },
      ],
    ]);
  });

  test("Nested Object with Array of primitives as leaf node, matching `mask`", () => {
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
    const leafNodeVals = getInternalNode(srcNode, maskNode);
    expect(leafNodeVals).toEqual([
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
    ]);
  });
});
