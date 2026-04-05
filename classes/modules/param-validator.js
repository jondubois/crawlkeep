import { isEmptyArr } from "../../utils/core/check/modules/is-empty-arr.js";
import { isEmptyObj } from "../../utils/core/check/modules/is-empty-obj.js";
import { isJsonArray } from "../../utils/core/check/modules/is-json-array.js";
import { typeOf } from "../../utils/core/type-of.js";
// import {
//   typeOf,
//   isEmptyArr,
//   isEmptyObj,
//   isJsonArray,
// } from "../../utils/index.js"; // DO NOT import `index.js`, orelse it creates a circular dependency

/**
 * @description parameter validation of data types and input
 * methods that start with "validate" are blocking the execution by throwing an error when validation fails, allowing errors to cascade up.
 * methods that start with "warn" are non-blocking and don't stop execution. The input is just unusual and notified to the Dev in the Console.
 * @method validateArray
 * @method validateArrayOfFundamentals
 * @method validateArrayOfStrings
 * @method validateArrIsNotEmpty
 * @method validateArrayOfStringsIsNotEmpty
 * @method validateBoolean
 * @method validateBuffer
 * @method validateCanHostSVGOverlay
 * @method validateFetch
 * @method validateFunction
 * @method validateHTMLElementOverlay
 * @method validateInteger
 * @method validateJsonArr
 * @method validateJsonArrIsNotEmpty
 * @method validateKeyedObj
 * @method validateMap
 * @method validateNumber
 * @method validatePrimitive
 * @method validateRegExp
 * @method validateSet
 * @method validateString
 * @method validateStringIsNotEmpty
 * @method validateTypedArray
 * @method validateUndefined
 * @method warnArrOfEmptyStrings
 * @method warnEmptyObj
 * @method warnJsonArrOfEmptyObjects
 * @method warnStringIsEmpty
 */
export class ParamValidator {
  static instance = null; // singleton
  static #validationEnabled = true;

  constructor() {
    if (ParamValidator.instance) {
      return ParamValidator.instance;
    }

    this.type = "";
    this.sub_key = "";

    ParamValidator.instance = this;
  }

  static getInstance() {
    if (!ParamValidator.instance) {
      ParamValidator.instance = new ParamValidator();
    }
    return ParamValidator.instance;
  }

  /**
   * Enable or disable validation globally
   * @param {boolean} enabled - Whether validation should be enabled
   */
  static setState(enabled) {
    ParamValidator.#validationEnabled = !!enabled;
  }

  static isValidationEnabled = () => {
    return ParamValidator.#validationEnabled;
  };

  validateArray = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!Array.isArray(arr)) {
      throw new TypeError(
        `Invalid data type. Expected ${arr} to be an Array. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  validateArrayOfFundamentals = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateArray(arr);

    if (
      !arr.every((elm) => {
        const data_type = typeOf(elm);
        return (
          data_type === "boolean" ||
          data_type === "number" ||
          data_type === "string"
        );
      })
    ) {
      throw new TypeError(
        `Invalid input. Expected ${arr} to be an Array of fundamental data type elements (boolean, number, string). Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  validateArrayOfStrings = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateArray(arr);
    if (!arr.every((str) => typeof str === "string")) {
      throw new TypeError(
        `Invalid data type. Expected ${arr} to be an Array of Strings. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  validateArrIsNotEmpty = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateArray(arr);
    if (isEmptyArr(arr)) {
      throw new ReferenceError(
        `Invalid data type. Expected ${arr} to be a non-empty Array. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  validateArrayOfStringsIsNotEmpty = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateArrayOfStrings(arr);
    if (arr.every((str) => str === "")) {
      throw new ReferenceError(
        `Invalid data type. Expected ${arr} to be an Array of non-empty Strings. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  validateBoolean = (bool) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeof bool !== "boolean") {
      throw new TypeError(
        `Invalid data type. Expected ${bool} to be a Boolean. Instead, was passed ${typeof bool}`,
      );
    }
  };

  validateBuffer = (buffer) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError(
        `Invalid data type. Expected ${buffer} to be a Buffer. Instead, was passed ${typeof buffer}`,
      );
    }
  };

  validateTypedArray = (typedArr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeOf(typedArr) !== "TypedArray") {
      throw new TypeError(
        `Invalid data type. Expected ${typedArr} to be a TypedArray. Instead, was passed ${typeOf(
          typedArr,
        )}`,
      );
    }
  };

  validateFetch = (query) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (
      typeOf(query) !== "Object" ||
      !("source" in query) ||
      !("lookup_keys" in query)
    ) {
      throw new TypeError(
        `Invalid data type. Expected ${query} to be a keyed Object with the properties:
            - source
            - lookup_keys.
        Instead, was passed ${typeOf(query)}`,
      );
    }
  };

  validateHTMLElementOverlay = (target) => {
    if (!ParamValidator.isValidationEnabled()) return;
    if (!(target instanceof HTMLElement)) {
      throw new TypeError(
        `Invalid data type. Expected ${target} to be an HTMLElement (e.g. <div>, <span>, <b>, <i>, etc.). Instead, was passed: ${target}`,
      );
    }
  };

  validateCanHostSVGOverlay = (target) => {
    if (!ParamValidator.isValidationEnabled()) return;
    if (
      !(
        target instanceof HTMLImageElement ||
        target instanceof HTMLCanvasElement ||
        target instanceof HTMLVideoElement ||
        target instanceof SVGElement ||
        target instanceof HTMLDivElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLIFrameElement
      )
    ) {
      throw new TypeError(
        `Invalid data type. Expected ${target} to be any of <img>, <canvas>, <video>, <svg>, <div>, <textarea>, or <iframe> element. Instead, was passed ${target}`,
      );
    }
  };

  /**
   * @todo - `ObjectChecker` can check for `Function` type. However, `typeOf` only allow through data that's not `object`.
   */
  validateFunction = (func) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeOf(func) !== "function") {
      throw new TypeError(
        `Invalid data type. Expected ${func} to be a Function. Instead, was passed ${typeof func}.`,
      );
    }
  };

  validateInteger = (num) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!Number.isInteger(num)) {
      throw new TypeError(
        `Invalid data type. Expected ${num} to be an Integer. Instead, was passed ${typeof num}`,
      );
    }
  };

  validateJsonArr = (json_arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateArray(json_arr);
    if (!isJsonArray(json_arr)) {
      throw new TypeError(
        `Invalid data type. Expected ${json_arr} to be an Array of keyed Objects. Instead, was passed ${typeOf(
          json_arr,
        )}`,
      );
    }
  };

  validateJsonArrIsNotEmpty = (json_arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateJsonArr(json_arr);
    if (json_arr.every((node) => isEmptyObj(node))) {
      throw new ReferenceError(
        `Invalid input. Expected ${json_arr} to be a non-empty Array of keyed Objects. Instead, was passed ${typeOf(
          json_arr,
        )}`,
      );
    }
  };

  validateKeyedObj = (obj) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeOf(obj) !== "Object") {
      throw new TypeError(
        `Invalid data type. Expected ${obj} to be a keyed Object. Instead, was passed ${typeOf(
          obj,
        )}`,
      );
    }
  };

  validateMap = (map) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!(map instanceof Map)) {
      throw new TypeError(
        `Invalid data type. Expected ${map} to be a Map. Instead, was passed ${typeOf(
          map,
        )}`,
      );
    }
  };

  validateNumber = (num) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeof num !== "number") {
      throw new TypeError(
        `Invalid data type. Expected ${num} to be a Number. Instead, was passed ${typeof num}`,
      );
    }
  };

  validatePrimitive = (value) => {
    if (!ParamValidator.isValidationEnabled()) return;

    const value_type = typeof value;
    const is_primitive =
      value_type === "string" ||
      value_type === "number" ||
      value_type === "boolean" ||
      value_type === "bigint" ||
      value_type === "symbol" ||
      value_type === "undefined" ||
      value === null;

    if (!is_primitive) {
      throw new TypeError(
        `Invalid data type. Expected ${value} to be a primitive value (string, number, boolean, bigint, symbol, undefined, or null). Instead, was passed ${typeOf(
          value,
        )}`,
      );
    }
  };

  validateRegExp = (regexp) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!(regexp instanceof RegExp)) {
      throw new TypeError(
        `Invalid data type. Expected ${regexp} to be a RegExp. Instead, was passed ${typeOf(
          regexp,
        )}`,
      );
    }
  };

  validateSet = (set) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (!(set instanceof Set)) {
      throw new TypeError(
        `Invalid data type. Expected ${set} to be a Set. Instead, was passed ${typeOf(
          set,
        )}`,
      );
    }
  };

  validateString = (str) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (typeof str !== "string") {
      throw new TypeError(
        `Invalid data type. Expected ${str} to be a String. Instead, was passed ${typeof str}`,
      );
    }
  };

  validateStringIsNotEmpty = (str) => {
    if (!ParamValidator.isValidationEnabled()) return;

    this.validateString(str);
    if (!str || str === "") {
      throw new ReferenceError(
        `Invalid data type. Expected ${str} to be a non-empty String. Instead, was passed ${typeOf(
          str,
        )}`,
      );
    }
  };

  validateUndefined = (input) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (input === undefined) {
      throw new TypeError(
        `Invalid data type. Expected ${input} to be defined. Instead, was passed ${typeof input}`,
      );
    }
  };

  /* Non-Blocking Warnings, that won't stop the execution */

  warnArrOfEmptyStrings = (arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (arr.every((str) => str === "")) {
      console.warn(
        `Invalid input. Expected Array ${arr} to be comprised of at least one non-empty String. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  };

  warnEmptyObj = (node) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (isEmptyObj(node)) {
      console.warn(
        `Invalid input. Expected ${node} to be a non-empty keyed Object. Instead, was passed ${typeOf(
          node,
        )}`,
      );
    }
  };

  warnJsonArrOfEmptyObjects = (json_arr) => {
    if (!ParamValidator.isValidationEnabled()) return;

    if (json_arr.every((node) => isEmptyObj(node))) {
      console.warn(
        `Invalid input. Expected ${json_arr} to be an Array of at least one non-empty keyed Objects. Instead, was passed ${typeOf(
          json_arr,
        )}`,
      );
    }
  };

  warnStringIsEmpty(str) {
    if (!ParamValidator.isValidationEnabled()) return;

    if (str === "") {
      console.warn(
        `Invalid input. Expected String ${str} to be non-empty. Instead, was passed ${typeOf(
          str,
        )}`,
      );
    }
  }
}
export default ParamValidator.getInstance();
