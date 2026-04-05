import { ParamValidator } from "./param-validator.js";
const param_validator = new ParamValidator();

class RecordManager {
  static #instance = null;

  #curr_record_i = 0;
  #records = [];

  constructor() {
    if (RecordManager.#instance) {
      throw new Error(
        "RecordManager is a singleton. Use getInstance() instead.",
      );
    }

    this.#curr_record_i = 0;
    this.#records = [];
    RecordManager.#instance = this;
  }

  static getInstance() {
    if (!RecordManager.#instance) {
      RecordManager.#instance = new RecordManager();
    }
    return RecordManager.#instance;
  }

  // separate initialization
  static initialise = (records) => {
    const instance = RecordManager.getInstance();
    if (records) {
      instance.setRecords(records);
    }
    return instance;
  };

  get records() {
    return [...this.#records]; // returns a copy to prevent modification / bypass of validation
  }

  setRecordIndex = (value) => {
    param_validator.validateInteger(
      value,
      this.constructor.name,
      "setRecordIndex",
    );
    this.#curr_record_i = value;
  };

  getRecordIndex = () => {
    return this.#curr_record_i;
  };

  getCurrentRecord = () => {
    return this.#records[this.#curr_record_i] || null;
  };

  setRecords = (records) => {
    param_validator.validateJsonArr(records);
    this.#records = records;
  };

  getRecordsLength = () => {
    return this.#records.length;
  };
}

export default RecordManager.getInstance();
