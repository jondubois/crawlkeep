/**
 * @classdesc A bi-directional aka bijective Map is a data structure that maintains a one-to-one correspondence between keys and values.
 * It supports bi-directional mapping.
 * @tutorial https://dev.to/pretaporter/data-structures-bidirectional-map-3f73
 */

export class BijectiveMap {
  constructor() {
    this.forwardMap = new Map();
    this.reverseMap = new Map();
  }

  set(key, value) {
    if (this.forwardMap.has(key)) {
      const oldValue = this.forwardMap.get(key);
      this.reverseMap.delete(oldValue);
    }
    if (this.reverseMap.has(value)) {
      const oldKey = this.reverseMap.get(value);
      this.forwardMap.delete(oldKey);
    }
    this.forwardMap.set(key, value);
    this.reverseMap.set(value, key);
  }

  getKey(value) {
    return this.reverseMap.get(value);
  }

  getValue(key) {
    return this.forwardMap.get(key);
  }

  deleteByKey(key) {
    const value = this.forwardMap.get(key);
    this.forwardMap.delete(key);
    this.reverseMap.delete(value);
  }

  deleteByValue(value) {
    const key = this.reverseMap.get(value);
    this.reverseMap.delete(value);
    this.forwardMap.delete(key);
  }

  hasKey(key) {
    return this.forwardMap.has(key);
  }

  hasValue(value) {
    return this.reverseMap.has(value);
  }

  keys() {
    return this.forwardMap.keys();
  }

  values() {
    return this.reverseMap.keys();
  }
}
