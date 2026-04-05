// Breadth-first-search for an object
function bfsObject(keyedObject, targetKey) {
  let queue = [keyedObject];

  while (queue.length > 0) {
    let node = queue.shift();

    for (let key in node) {
      if (key === targetKey) {
        return node[key];
      }

      if (typeof node[key] === "object" && node[key] !== null) {
        queue.push(node[key]);
      }
    }
  }
  // if not found
  return null;
}

// Breadth-first-search for an array
function bfsArray(array, criteriaFn) {
  let current = array;
  let next = [];

  while (current) {
    if (criteriaFn(current)) {
      return current;
    }

    if (Array.isArray(current)) {
      for (let i = 0, l = current.length; i < l; i++) {
        next.push(current[i]);
      }
    }

    current = next.shift();
  }
  // if not found
  return null;
}
