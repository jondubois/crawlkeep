import param_validator from "../../../../classes/modules/param-validator.js";

export class BaseEntity {
  #All_MASKS_TO_ENTITY = {
    PERSON: {},
    JOB: { jobs: [{}] },
    COMPANY: { jobs: [{ company: {} }] },
    DEGREE: { edus: [{}] },
    SCHOOL: { edus: [{ school: {} }] },
    CERTIFICATION: { certs: [{}] },
    CERTIFICATION_INSTITUTION: { certs: [{ company: {} }] },
    // COMPANIES_FOLLOWING: { companies_following: [{}] },
    // COMPANY_FOLLOWING: { companies_following: [{ company: {} }] },
    // VOLS: { vols: [{}] },
    // COMPANY_VOLS: { vols: [{ company: {} }] },
  };

  // pre-defined values in an immutable object
  #All_PATHS_TO_ENTITY = {
    PERSON: [],
    JOB: ["jobs"],
    COMPANY: ["jobs", "company"],
    DEGREE: ["edus"],
    SCHOOL: ["edus", "school"],
    CERTIFICATION: ["certs"],
    CERTIFICATION_INSTITUTION: ["certs", "company"],
  };

  #ALL_NESTED_PROP_KEYS = {
    PERSON: ["jobs", "edus", "certs"],
    JOB: ["company"],
    COMPANY: [""],
    DEGREE: ["school"],
    SCHOOL: [""],
    CERTIFICATION: ["company"],
    CERTIFICATION_INSTITUTION: [""],
  };

  #validateEntityName(name) {
    param_validator.validateString(name);
    const ENTITY_NAMES = this.entity_names;
    if (!ENTITY_NAMES.includes(name)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateEntityName - Invalid input. Expected ${name} to be one of these options: ${ENTITY_NAMES.join(
          ", ",
        )}.`,
      );
    }
    if (!name) {
      console.warn(
        `${this.constructor.name}.validateEntityName - Sub key is empty: `,
        name,
      );
      return;
    }
  }

  constructor() {
    this.validateEntityName = this.#validateEntityName.bind(this);
    /* in JavaScript, private field / method are supported using the # prefix, which is part of the ECMAScript 2022 (ES13) standard
    Controlled access to the private method. `bind()` sets `this` to the current instance.
    This ensures that the `this` of `#validateEntityName` always refers to the instance of `PropAddingStrategy` (lexical context),
    even if it is passed around as a callback or used in a different scope. */
  }

  get entity_names() {
    return Object.keys(this.#All_MASKS_TO_ENTITY);
  }

  get all_masks_to_entity() {
    return this.#All_MASKS_TO_ENTITY;
  }

  get all_paths_to_entity() {
    return this.#All_PATHS_TO_ENTITY;
  }

  get all_nested_prop_keys() {
    return this.#ALL_NESTED_PROP_KEYS;
  }
}

export class LookupProps extends BaseEntity {
  #PERSON_KEYS = [
    "public_url",
    "first_name",
    "last_name",
    "headline",
    "can_send_inmail",
    "privacy_allows_connections_browse",
    "country",
    "state",
    "city",
    "location",
    "public_id",
    "lir_niid",
    "industry",
    "network_distance",
    "profile_img",
    "previous_locations",
    "number_of_connections",
    "ts_hire_identity",
    "member_id",
    "companies_following",
    "skills",
    "jobs",
    "edus",
    "open_to_opportunities",
    "job_seeking_urgency_level",
    "privacy_show_badge",
    "websites",
    "desired_titles",
    "desired_locations",
    "desired_employment_types",
    "summary",
    "certs",
    "languages",
    "courses",
    "patents",
    "desired_company_max_size",
    "desired_company_min_size",
    "vols",
    "recommendations",
    "pro_projects",
    "test_scores",
    "twitters",
    "honors",
    "emails",
    "phones",
    "instant_messengers",
  ];
  #TEXT_SEARCHABLE_PERSON_KEYS = [
    "current_company_name",
    "current_job_title",
    "first_name",
    "headline",
    "last_name",
    "location",
    "previous_locations",
    "skills",
    "summary",
    "first_name",
    "last_name",
    "headline",
    "country",
    "state",
    "city",
    "location",
    "industry",
    "previous_locations",
    "job_seeking_urgency_level",
    "desired_titles",
    "desired_locations",
    "desired_employment_types",
    "summary",
    "twitters",
    "emails",
    "phones",
  ];
  #NESTED_PERSON_KEYS = [
    "companies_following",
    "jobs",
    "edus",
    "websites",
    "certs",
    "languages",
    "courses",
    "patents",
    "vols",
    "recommendations",
    "pro_projects",
    "test_scores",
    "honors",
    "instant_messengers",
  ];
  #NUMERIC_PERSON_KEYS = [
    "number_of_connections",
    "ts_hire_identity",
    "member_id",
    "desired_company_max_size",
    "desired_company_min_size",
  ];
  #ID_PERSON_KEYS = ["public_id", "lir_niid", "member_id"]; // new Set()
  #NAME_PERSON_KEYS = ["first_name", "last_name"];
  #CAREER_PERSON_KEYS = ["headline", "skills", "summary", "current_job_title"];
  #LOCATION_PERSON_KEYS = [
    "city",
    "state",
    "country",
    "location",
    "previous_locations",
  ];

  // Job
  #JOB_KEYS = [
    "job_description",
    "job_industries",
    "job_skills",
    "job_title",
    "job_country",
    "job_description",
    "job_display_location",
    "job_employment_status",
    "job_skills",
    "job_title",
    "country",
    "description",
    "display_location",
    "employment_status",
    "end_timestamp",
    "industries",
    "is_current",
    "millseconds_in_job",
    "skills",
    "start_timestamp",
    "title",
  ];
  #TEXT_SEARCHABLE_JOB_KEYS = [
    "country",
    "description",
    "display_location",
    "employment_status",
    "industries",
    "skills",
    "title",
  ];
  #NUMERIC_JOB_KEYS = [
    "end_timestamp",
    "millseconds_in_job",
    "start_timestamp",
  ];
  #BOOLEAN_JOB_KEYS = ["is_current"];
  #JOB_COMBINATIONS = [
    // ["job_title", "headline"],
    // ["job_title", "summary"],
    // ["job_title", "skills"],
    // ["job_title", "job_description"],
    // ["job_title", "job_skills"],
    // ["headline", "job_description"],
    // ["summary", "job_description"],
    // ["skills", "job_description"],
    ["title", "headline"],
    ["title", "summary"],
    ["title", "skills"],
    ["title", "description"],
    ["headline", "description"],
    ["summary", "description"],
    ["skills", "description"],
    // ["degree_name", "title"]
  ];

  // company
  #TEXT_SEARCHABLE_COMPANY_KEYS = [
    "company_description",
    "company_hq_region",
    "company_name",
    "description",
    "hq_region",
    "industries",
    "name",
    "specialities",
    "tagline",
    "type",
    "universal_name",
  ];
  #NUMERIC_COMPANY_KEYS = [
    "created_on",
    "founded_on",
    "employee_count_high",
    "employee_count_low",
    "num_employees",
    "num_followers",
    "follower_count",
    "staff_count_high",
    "staff_count_low",
  ];
  #ID_COMPANY_KEYS = ["id", "universal_name", "ucn"]; // "company_id"
  #NAME_COMPANY_KEYS = ["name", "universal_name"];
  #DESCRIPTION_COMPANY_KEYS = [
    "tagline",
    "description",
    "industries",
    "specialities",
    "type",
  ];
  #LOCATION_COMPANY_KEYS = new Set([
    "city",
    "country",
    "lat",
    "lng",
    "postal_code",
    "state_name",
    "state_abbr",
    "street",
  ]);
  #URL_COMPANY_KEYS = ["url", "linkedin_url", "website"];
  #COMPANY_KEYS = new Set([
    ...this.#DESCRIPTION_COMPANY_KEYS,
    ...this.#ID_COMPANY_KEYS,
    ...this.#LOCATION_COMPANY_KEYS,
    ...this.#NAME_COMPANY_KEYS,
    ...this.#NUMERIC_COMPANY_KEYS,
    ...this.#TEXT_SEARCHABLE_COMPANY_KEYS,
    ...this.#URL_COMPANY_KEYS,
  ]);

  // Education
  #EDU_KEYS = [
    "edu_degree_name",
    "edu_field_of_study",
    "field_of_study",
    "institution_name",
    "end_year",
    "start_year",
    "degree_name",
  ];
  #TEXT_SEARCHABLE_EDU_KEYS = [
    "field_of_study",
    "institution_name",
    "degree_name",
  ];
  #NUMERIC_EDU_PROPS = [
    "edu_end_year",
    "edu_start_year",
    "end_year",
    "start_year",
  ];

  // School
  #SCHOOL_KEYS = ["school_name", "name", "id"];
  #TEXT_SEARCHABLE_SCHOOL_KEYS = ["name"]; // "institution_name"
  #ID_SCHOOL_KEYS = ["id"];

  // Certification
  #CERT_KEYS = [
    "cert_name",
    "cert_url",
    "name",
    "start_timestamp",
    "end_timestamp",
    "millseconds_in_cert",
    "url",
  ];
  #TEXT_SEARCHABLE_CERT_PROPS = ["name", "url"];
  #NESTED_CERT_KEYS = ["company", "company_name"];

  // Certification Institution
  #CERT_INSTITUTION_KEYS = ["company_name", "name", "id", "follower_count"];
  #TEXT_SEARCHABLE_CERT_INSTITUTION_KEYS = ["name"];
  #ID_CERT_INSTITUTION_KEYS = ["id"];
  #NUMERIC_CERT_INSTITUTION_KEYS = ["follower_count"];

  // Singleton pattern
  static instance = null; // initializes the static instance to null
  constructor() {
    if (LookupProps.instance) {
      return LookupProps.instance;
    }
    super();
    this.entity_name = "";
    this.text_keys = [];
    this.number_keys = [];
    this.combinations = [];
    this.mask_to_entity = {};
    this.path_to_entity = [];
    LookupProps.instance = this;
  }

  // factory pattern
  static getInstance() {
    if (!LookupProps.instance) {
      LookupProps.instance = new LookupProps();
    }
    return LookupProps.instance;
  } /* Static properties are shared among all instances of a class.
       So, if the parent Class has a `static` instance property, it is shared with its children,
       which can cause conflicts between siblings.
       Hence why, we can't implement the Singelton pattern in the parent class */

  setStateTo = (entity_name) => {
    this.validateEntityName(entity_name);
    if (!(entity_name in this.all_masks_to_entity)) {
      throw new Error(
        `${this.constructor.name}.setStateTo - Unknown entity name: ${entity_name}`,
      );
    }
    this.entity_name = entity_name;
    this.text_keys = [];
    this.number_keys = [];
    this.combinations = [];
    this.mask_to_entity = this.all_masks_to_entity[entity_name];
    this.path_to_entity = this.all_paths_to_entity[entity_name];

    switch (entity_name) {
      case "PERSON":
        this.text_keys = [
          // ...this.person_name_text_keys,
          ...this.person_career_keys,
          // ...this.person_location_keys,
        ];
        break;
      case "JOB":
        // this.external_mask = this.all_masks_to_entity["PERSON"];
        this.text_keys = this.job_text_keys;
        this.number_keys = this.job_number_keys;
        this.combinations = this.job_combination_keys;
        break;
      case "COMPANY":
        this.text_keys = this.company_text_keys;
        break;
      case "DEGREE":
        this.text_keys = this.degree_text_keys;
        break;
      case "SCHOOL":
        this.text_keys = this.school_text_keys;
        break;
      case "CERTIFICATION":
        this.text_keys = this.certification_text_keys;
        break;
      case "CERTIFICATION_INSTITUTION":
        this.text_keys = this.cert_institution_text_keys;
        break;
      default:
        throw new Error(
          `${this.constructor.name}.setStateTo - Unknown entity name: ${entity_name}`,
        );
    }
  };

  // Person
  get person_name_text_keys() {
    return this.#NAME_PERSON_KEYS;
  }
  get person_career_keys() {
    return this.#CAREER_PERSON_KEYS;
  }
  get person_location_keys() {
    return this.#LOCATION_PERSON_KEYS;
  }
  get person_id_keys() {
    return this.#ID_PERSON_KEYS;
  }

  // Job
  get job_text_keys() {
    // TODO - "current_job_title" should only apply to rec.jobs[0]
    return this.#TEXT_SEARCHABLE_JOB_KEYS;
  }
  get job_number_keys() {
    return this.#NUMERIC_JOB_KEYS;
  }
  get job_boolean_keys() {
    return this.#BOOLEAN_JOB_KEYS;
  }
  get job_combination_keys() {
    return this.#JOB_COMBINATIONS;
  }

  // Company
  get company_text_keys() {
    // this.#TEXT_SEARCHABLE_COMPANY_KEYS;
    return [
      "name",
      "universal_name",
      "tagline",
      "description",
      "industries",
      "specialities",
      "type",
    ]; // new Set(
  }
  get text_company_keys() {
    return this.#TEXT_SEARCHABLE_COMPANY_KEYS;
  }
  get company_id_keys() {
    return this.#ID_COMPANY_KEYS; //  "affiliated_company_ids", "parent_company_id"
  }
  get company_name_keys() {
    return this.#NAME_COMPANY_KEYS;
  }
  get company_description_keys() {
    return this.#DESCRIPTION_COMPANY_KEYS;
  }
  get company_numeric_keys() {
    return this.#NUMERIC_COMPANY_KEYS;
  }
  get company_location_keys() {
    return this.#LOCATION_COMPANY_KEYS;
  }
  get company_url_keys() {
    return this.#URL_COMPANY_KEYS;
  }

  // Degree
  get degree_text_keys() {
    return this.#TEXT_SEARCHABLE_EDU_KEYS;
  }

  // School
  get school_text_keys() {
    return this.#TEXT_SEARCHABLE_SCHOOL_KEYS;
  }
  get school_id_keys() {
    return this.#ID_SCHOOL_KEYS;
  }

  // Certification
  get certification_text_keys() {
    return this.#TEXT_SEARCHABLE_CERT_PROPS;
  }

  // Certification Institution
  get cert_institution_text_keys() {
    return this.#TEXT_SEARCHABLE_CERT_INSTITUTION_KEYS;
  }
  get cert_institution_id_keys() {
    return this.#ID_CERT_INSTITUTION_KEYS;
  }
}
