import { typeOf } from "../utils/shared/type-of.js";
// import { isEmptyArr, isEmptyObj, isJsonArray } from "../utils/shared/check/index.js";
import {
  isEmptyArr,
  isEmptyObj,
  isJsonArray,
} from "../utils/shared/check/index.js";

/***
 * @method validateUndefined
 * @method validateString
 * @method validateStrIsNotEmpty
 * @method validateNumber
 * @method validateBuffer
 * @method validateArray
 * @method validateArrIsNotEmpty
 * @method validateArrOfStrIsNotEmpty
 * @method validateKeyedObj
 * @method validateBoolean
 * @method validateFunction
 * @method validateMap
 * @method validateArrOfStr
 * @method validateJsonArr
 * @method validateMap
 * @method validateFetch
 * @method warnArrOfStrIsEmpty
 * @method warnEmptyObj
 */
export class ParamValidator {
  #validateUndefined(input) {
    if (input === undefined) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateString - Invalid input. Expected ${input} to be defined. Instead, was passed ${typeof input}`,
      );
    }
  }

  #validateString(str) {
    if (typeof str !== "string") {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateString - Invalid input. Expected ${str} to be a String. Instead, was passed ${typeof str}`,
      );
    }
  }

  #validateNumber(num, constructor_name, fun_name) {
    if (typeof num !== "number") {
      throw new TypeError(
        `${constructor_name}.${fun_name} - Invalid input. Expected ${num} to be a Number. Instead, was passed ${typeof num}`,
      );
    }
  }

  #validateInteger(num, constructor_name, fun_name) {
    if (!Number.isInteger(num)) {
      throw new TypeError(
        `${constructor_name}.${fun_name} - Invalid input. Expected ${num} to be an Integer. Instead, was passed ${typeof num}`,
      );
    }
  }

  #validateBoolean(bool) {
    if (typeof bool !== "boolean") {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateBoolean - Invalid input. Expected ${bool} to be a Boolean. Instead, was passed ${typeof bool}`,
      );
    }
  }

  #validateBuffer(buffer) {
    if (typeOf(buffer) !== "Buffer") {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateBuffer - Invalid input. Expected ${buffer} to be a Boolean. Instead, was passed ${typeof buffer}`,
      );
    }
  }

  #validateRegExp(regex) {
    if (!(regex instanceof RegExp)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateRegExp - Invalid input. Expected ${regex} to be an instance of RegExp. Instead, was passed ${typeof regex}`,
      );
    }
  }

  #validateArray(arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateArray - Invalid input. Expected ${arr} to be an Array. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  }

  #validateArrOfStr(arr) {
    if (
      !Array.isArray(arr) ||
      !arr.length ||
      !arr.every((key) => typeof key === "string")
    ) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateArrOfStr - Invalid input. Expected ${arr} to be an Array of Strings. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  }

  #validateKeyedObj(obj) {
    if (typeOf(obj) !== "Object") {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateKeyedObj - Invalid input. Expected ${obj} to be a keyed Object. Instead, was passed ${typeOf(
          obj,
        )}`,
      );
    }
  }

  #validateJsonArr(arr) {
    if (!isJsonArray(arr)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateJsonArr - Invalid input. Expected ${arr} to be an Array of keyed Objects. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  }

  #validateMap(map, constructor_name, fun_name) {
    if (!(map instanceof Map)) {
      throw new TypeError(
        `${constructor_name}.${fun_name} - Invalid input. Expected ${map} to be a Map. Instead, was passed ${typeOf(
          map,
        )}`,
      );
    }
  }

  #validateFetch(query) {
    if (
      typeOf(query) !== "Object" ||
      !("source" in query) ||
      !("lookup_keys" in query)
    ) {
      throw new TypeError(
        `${
          this.constructor.name
        }.validateFetch - Invalid input. Expected ${query} to be a keyed Object with the properties:
          - source
          - lookup_keys. Instead, was passed ${typeOf(query)}`,
      );
    }
  }

  #validateStrIsNotEmpty(str) {
    if (!str || str === "") {
      throw new ReferenceError(
        `${
          this.constructor.name
        }.validateStrIsNotEmpty - Invalid input. Expected ${str} to be a non-empty Array. Instead, was passed ${typeOf(
          str,
        )}`,
      );
    }
  }

  #validateArrIsNotEmpty(arr) {
    if (isEmptyArr(arr)) {
      throw new ReferenceError(
        `${
          this.constructor.name
        }.validateArrIsNotEmpty - Invalid input. Expected ${arr} to be a non-empty Array. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  }

  #validateArrOfStrIsNotEmpty(arr) {
    if (arr.every((str) => str === "")) {
      throw new ReferenceError(
        `${
          this.constructor.name
        }.validateArrOfStrIsNotEmpty - Invalid input. Expected ${arr} to be an Array of non-empty Strings. Instead, was passed ${typeOf(
          arr,
        )}`,
      );
    }
  }

  #warnArrOfStrIsEmpty(arr) {
    if (arr.every((str) => str === "")) {
      console.warn(
        `${this.constructor.name}.warnArrOfStrIsEmpty - Array of Strings ${arr} is comprised only of empty Strings.`,
      );
    }
  }

  #warnEmptyObj(node) {
    if (isEmptyObj(node)) {
      console.warn(
        `${this.constructor.name}.warnEmptyObj - Node is empty: ${node}`,
        node,
      );
      return;
    }
  }

  constructor() {
    this.type = "";
    this.sub_key = "";
    this.validateUndefined = this.#validateUndefined.bind(this);
    this.validateString = this.#validateString.bind(this);
    this.validateNumber = this.#validateNumber.bind(this);
    this.validateInteger = this.#validateInteger.bind(this);
    this.validateBoolean = this.#validateBoolean.bind(this);
    this.validateBuffer = this.#validateBuffer.bind(this);
    this.validateRegExp = this.#validateRegExp.bind(this);
    this.validateArray = this.#validateArray.bind(this);
    this.validateArrOfStr = this.#validateArrOfStr.bind(this);
    this.validateKeyedObj = this.#validateKeyedObj.bind(this);
    this.validateJsonArr = this.#validateJsonArr.bind(this);
    this.validateMap = this.#validateMap.bind(this);
    this.validateFetch = this.#validateFetch.bind(this);
    this.validateStrIsNotEmpty = this.#validateStrIsNotEmpty.bind(this);
    this.validateArrIsNotEmpty = this.#validateArrIsNotEmpty.bind(this);
    this.validateArrOfStrIsNotEmpty =
      this.#validateArrOfStrIsNotEmpty.bind(this);
    this.warnEmptyObj = this.#warnEmptyObj.bind(this);
    this.warnArrOfStrIsEmpty = this.#warnArrOfStrIsEmpty.bind(this);
    /* controlled access to the private method. `bind()` sets `this` to the current instance.
    This ensures that the `this` of `#addTagTo` always refers to the instance of `PropAddingStrategy` (lexical context),
    even if it is passed around as a callback or used in a different scope. */
  }
}

// TODO - set up
// #validateMap(map, context) {
//   if (!(map instanceof Map)) {
//     const { constructor_name, function_name } = getFunctionDetails(context);
//     throw new TypeError(
//       `${constructor_name}.${function_name} - Invalid input. Expected ${map} to be a Map. Instead, was passed ${typeOf(map)}`,
//     );
//   }
// }
// function getFunctionDetails(context) {
//   const is_class =
//     typeof context.constructor === "function" &&
//     context.constructor.prototype &&
//     context.constructor.prototype.constructor === context.constructor;

//   const constructor_name = is_class
//     ? context.constructor.name
//     : typeof context.constructor;
//   const function_name = getMethodName();

//   return { constructor_name, function_name };
// }

// function getMethodName() {
//   const error = new Error();
//   const stack = error.stack.split("\n");
//   // The method name is usually in the third line of the stack trace
//   const methodLine = stack[3];
//   const methodNameMatch = methodLine.match(/at (\w+)/);
//   return methodNameMatch ? methodNameMatch[1] : "anonymous";
// }
