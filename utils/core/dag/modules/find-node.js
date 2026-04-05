/**
 * Finds a node by its value or id in a collection of nodes.
 * @param {Array} nodes - The collection of nodes to search through.
 * @param {String|Number} id - The value of ID to find.
 * @returns {Object|null} - The found node or null if not found.
 */
export function findNode(nodes, id) {
  return nodes.find((node) => node.id === id || node.value === id) || null;
}
