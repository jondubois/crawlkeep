// /**
//  * NO LONGER WORKS. TreeStructure was replaced by TreeParser.
//  * Converts a DAG into a hierarchical tree,
//  * using Breadth-First Traversal (BFT) algorithm.
//  * @param {object} root_node - The root node of the tree.
//  * @param {object} dag - The Directed Acyclic Graph (DAG) containing the nodes and edges.
//  * @returns {TreeParser} - The root node of the built hierarchical tree.
//  */

// export function toHierarTreeBFT(root_node, dag) {
//   // Helper function
//   function findChildren(nodeId) {
//     return dag.edges
//       .filter((edge) => edge.from === nodeId)
//       .map((edge) => edge.to);
//   }

//   // initialise the root of the tree
//   let root = new TreeParser(root_node.label);
//   let nodeMap = new Map();
//   nodeMap.set(root_node.id, root);
//   // copy all attributes from the DAG root node to the Tree root node
//   Object.assign(root, root_node); // overwrites the property/value pairs of the target object `root` with those from the last source objects `root_node`

//   let queue = [root_node.id];

//   while (queue.length > 0) {
//     let currentId = queue.shift();
//     let currentNode = nodeMap.get(currentId);
//     let childrenIds = findChildren(currentId);

//     childrenIds.forEach((childId) => {
//       if (!nodeMap.has(childId)) {
//         let childNodeData = dag.nodes.find((node) => node.id === childId);
//         let childTreeNode = new TreeParser(childNodeData.label);
//         // copy all attributes from the DAG node to the Tree node
//         Object.assign(childTreeNode, childNodeData);
//         // store parent node
//         childTreeNode.parent = currentNode;
//         // set reference to ID of parent node
//         childTreeNode.parent_id = currentNode.id;
//         nodeMap.set(childId, childTreeNode);
//         currentNode.children.push(childTreeNode);
//         queue.push(childId);
//       }
//     });
//   }

//   return root;
// }
