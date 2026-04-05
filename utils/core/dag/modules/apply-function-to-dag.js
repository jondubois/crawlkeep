export function applyFunctionToDAG(dag, func) {
  // Step 1: Identify all leaf nodes
  let leafNodes = dag.nodes.filter(
    (node) => !dag.edges.some((edge) => edge.from === node.id),
  );

  // Step 2: initialise a map to store intermediate results
  let resultsMap = new Map();

  // Helper function to recursively apply func and backtrack
  function backtrackAndApply(node) {
    // Base case: if the node is a leaf, apply func directly
    if (leafNodes.includes(node)) {
      let result = func(node.label);
      resultsMap.set(node.id, result);
      return result;
    }

    // Recursive case: combine results from children, then apply func
    let combinedChildrenResult = dag.edges
      .filter((edge) => edge.from === node.id)
      .map((edge) => {
        let childNode = dag.nodes.find((n) => n.id === edge.to);
        // If result is already computed, use it; otherwise, compute
        if (!resultsMap.has(childNode.id)) {
          backtrackAndApply(childNode);
        }
        return resultsMap.get(childNode.id);
      })
      .reduce((acc, curr) => acc + curr, ""); // Example of combining results

    let finalResult = func(node.label + combinedChildrenResult);
    resultsMap.set(node.id, finalResult);
    return finalResult;
  }

  // Step 3: Apply the function to all nodes, starting from leaf nodes
  dag.nodes.forEach((node) => {
    if (!resultsMap.has(node.id)) {
      backtrackAndApply(node);
    }
  });

  return resultsMap;
}

// applyFunctionToDAG(dag, func);
