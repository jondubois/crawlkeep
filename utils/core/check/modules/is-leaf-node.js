/**
 * Determines if a node is a leaf node (i.e., has no children).
 * @param {Array} edges - The collection of edges (for DAG) or children property (for TreeNode).
 * @param {String} nodeId - The id of the node to check.
 * @returns {Boolean} - True if the node is a leaf, false otherwise.
 */
export function isLeafNode(edges, nodeId) {
  if (Array.isArray(edges)) {
    // Assuming edges is an array for DAG
    return !edges.some((edge) => edge.from === nodeId);
  } else {
    // Assuming edges is the children property for TreeNode
    return edges.length === 0;
  }
}
