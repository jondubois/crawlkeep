import { typeOf } from "../../type-of.js";

function levelOrderTraversal(root_node) {
  if (typeOf(root_node) !== "Object") {
    throw new TypeError(
      `levelOrderTraversal - Invalid input. Expected ${root_node} to be a keyed collection. Instead, got ${typeof root_node}`,
    );
  }
  if (!root_node) return [];

  const queue = [root_node];
  const result = []; // This array will store the values of nodes by level

  while (queue.length > 0) {
    const levelSize = queue.length; // Number of elements at the current level
    const currentLevel = []; // Array to store nodes of the current level

    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue.shift();

      // Process the current node (e.g., add its value to the current level array)
      currentLevel.push(currentNode.value); // Assuming nodes have a 'value' property

      // Recurse
      if (currentNode.children) {
        currentNode.children.forEach((child) => queue.push(child)); // Assuming nodes have a 'children' property
      }
    }

    // After finishing the current level, add its nodes to the result array
    result.push(currentLevel);
  }

  return result; // Return the level order traversal result
}

// // Assuming `tree` is the root node of your tree
// const levelOrderResult = levelOrderTraversal(tree);
// console.log(levelOrderResult);
