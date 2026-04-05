export class ObjectChecker {
  constructor(obj) {
    this.obj = obj;
  }

  isArray() {
    return Array.isArray(this.obj);
  }

  isFunction() {
    return typeof this.obj === "function";
  }

  isDate() {
    return this.obj instanceof Date;
  }

  isRegExp() {
    return this.obj instanceof RegExp;
  }

  isPromise() {
    return (
      !!this.obj &&
      (typeof this.obj === "object" || typeof this.obj === "function") &&
      typeof this.obj.then === "function"
    );
  }

  isMap() {
    return this.obj instanceof Map;
  }

  isSet() {
    return this.obj instanceof Set;
  }

  isWeakMap() {
    return this.obj instanceof WeakMap;
  }

  isWeakSet() {
    return this.obj instanceof WeakSet;
  }

  // TypedArray (Checking for one example, Int32Array. Similar checks can be done for other types)
  isTypedArray() {
    return ArrayBuffer.isView(this.obj) && !(this.obj instanceof DataView);
  }

  isArrayBuffer() {
    return this.obj instanceof ArrayBuffer;
  }

  // Error (Checking if it's an error object. Specific error types can be checked similarly)
  isError() {
    return this.obj instanceof Error;
  }

  getType() {
    if (this.isArray()) return "Array";
    if (this.isFunction()) return "Function";
    if (this.isDate()) return "Date";
    if (this.isRegExp()) return "RegExp";
    if (this.isPromise()) return "Promise";
    if (this.isMap()) return "Map";
    if (this.isSet()) return "Set";
    if (this.isWeakMap()) return "WeakMap";
    if (this.isWeakSet()) return "WeakSet";
    if (this.isTypedArray()) return "TypedArray";
    if (this.isArrayBuffer()) return "ArrayBuffer";
    if (this.isError()) return "Error";
    return "Unknown";
  }

  getType1() {
    let type_str = Object.prototype.toString.call(this.obj);
    switch (type_str) {
      case "[object Array]":
        return "Array";
      case "[object Object]":
        return "Object";
      case "[object Function]":
        return "Function";
      case "[object Date]":
        return "Date";
      case "[object RegExp]":
        return "RegExp";
      case "[object Promise]":
        return "Promise";
      case "[object Map]":
        return "Map";
      case "[object Set]":
        return "Set";
      case "[object WeakMap]":
        return "WeakMap";
      case "[object WeakSet]":
        return "WeakSet";
      case "[object Int8Array]":
      case "[object Uint8Array]":
      case "[object Uint8ClampedArray]":
      case "[object Int16Array]":
      case "[object Uint16Array]":
      case "[object Int32Array]":
      case "[object Uint32Array]":
      case "[object Float32Array]":
      case "[object Float64Array]":
        return "TypedArray";
      case "[object ArrayBuffer]":
        return "ArrayBuffer";
      case "[object Error]":
        return "Error";
      default:
        return "Unknown";
    }
  }
}
