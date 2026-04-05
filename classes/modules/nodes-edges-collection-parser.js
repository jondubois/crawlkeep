import { v4 as uuidv4 } from "uuid";
// external imports
import { splitBy, typeOf } from "../../utils/index.js";

// local imports
import { Divider, EnclosingDivider, LeadTrailingDivider } from "./divider.js";
import { BaseParser } from "./base/base-parser.js";
import { ParamValidator } from "./param-validator.js";
const param_validator = ParamValidator.getInstance();

const bool_operators = ["AND", "OR", "NOT"];
const lt_dividers = bool_operators.map((op) => new LeadTrailingDivider(op));
const lt_div_regexes = lt_dividers.map((div) => div.tryRegExp());

/**
 * @classdesc Manipulates a Nodes & Edges Collections
 *
 * @method initDAG - Generates a Directed Acyclic Graph (DAG) from a keyword search string.
 * @method splitLeafByDiv - Splits a leaf node by a given divider.
 * @method splitLeafByFunc - Splits a leaf node by a given function.
 * @method setLeadTrailingOperator - Sets leading and trailing operators for leaf nodes.
 * @method isNodeInDAG - Checks if a node is part of the DAG.
 * @method addNode - Adds a node and its corresponding edge to the DAG.
 * @method removeNode - Removes a node and its corresponding edges from the DAG.
 * @method getRootNode - Returns the root node of the DAG.
 * @method getLeafNodes - Returns all leaf nodes of the DAG.
 * @method findNode - Finds a node by its ID.
 * @method findChildren - Finds the children of a given node.
 * @method toHierarchicalTree - Converts the DAG to a hierarchical tree structure.
 * @method getPathToNode - Returns the path from the root node to a given target node.
 * @method getPathToNodeBy - Returns the path from the root node to a given target node using specified keys.
 * @method toNodeTreeBy - Converts the DAG to a tree structure using a specified child property.
 */
export class NodesEdgesCollectionParser extends BaseParser {
  #validateInput = (n_e_coll, child_entries_key = this.child_entries_key) => {
    param_validator.validateKeyedObj(n_e_coll);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (!("nodes" in n_e_coll) || !("edges" in n_e_coll)) {
      throw new TypeError(
        `${this.constructor.name}.validateInput - Invalid input. Expected ${n_e_coll} to have as properties:
        - nodes
        - edges`,
      );
    }
    param_validator.validateJsonArr(n_e_coll?.nodes);
    param_validator.validateArray(n_e_coll?.edges);
  };

  constructor() {
    super();
    this.nodes = [];
    this.edges = [];
    this.root_node = null;
  }

  get validateInput() {
    return this.#validateInput.bind(this);
  }

  // get node_name_key() {
  //   return this.node_name_key;
  // }

  // get child_entries_key() {
  //   return this.child_entries_key;
  // }

  // get node_id_key() {
  //   return this.node_id_key;
  // }

  /**
   * Generates a Directed Acyclic Graph (DAG) from a keyword search string.
   * Each node in the DAG represents a unique fragment of the sentence, with hard-coded properties `id` and `label`
   * @param {string} sentence - The sentence to create a DAG from.
   * @returns {Object} - An object representing the DAG with a single node and no edges.
   *
   * @todo - `label` is hard-coded. Instead, use `this.node_label`
   */
  initDAG = (sentence) => {
    param_validator.validateString(sentence);

    // initialise the root node of the DAG with the entire sentence
    this.root_node = { [this.node_id_key]: uuidv4(), label: sentence }; // TODO - `label` is hard-coded. Instead, use `this.node_label`
    this.nodes.push(this.root_node);
    this.edges = [];
  };

  setStateTo = (dag, child_entries_key = this.child_entries_key) => {
    this.validateInput(dag, child_entries_key);
    this.nodes = dag.nodes;
    this.edges = dag.edges;
    this.root_node = this.getRootNode();
  };

  // arguments passed ByRef. Mutates DAG in-place
  splitLeafByDiv = (node, divider) => {
    if (!this.isNodeInDAG(node)) {
      throw new Error(
        `${
          this.constructor.name
        }.splitLeafByDiv - Invalid input. Expected node with ID ${
          node[this.node_id_key]
        } to be part of the DAG (Directed Acyclic Graph).`,
      );
    }
    param_validator.validateString(node.label);
    if (!(divider instanceof Divider || divider instanceof EnclosingDivider)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.splitLeafByDiv - Invalid input. Expected ${divider} to be an instance of Divider OR EnclosingDivider. Instead was passed ${typeof divider}`,
      );
    }

    if (!node.label) {
      return this;
    }

    const regex = divider.tryRegExp();
    if (regex instanceof Error) {
      throw new TypeError(
        `${this.constructor.name}.splitLeafByDiv - Invalid input. Expected ${regex} to be a valid regular expression. Instead, an error was thrown: ${regex.message}`,
      );
    }

    let stack = [node];
    let visited = new Set();

    while (stack.length > 0) {
      let currentNode = stack.pop();
      let id = currentNode[this.node_id_key];
      currentNode.label = currentNode.label.trim();

      if (!visited.has(id)) {
        // mark node as visited
        visited.add(id);
        const isLeaf = !this.edges.some((edge) => edge.from === id);
        if (isLeaf) {
          const splitResult = splitBy(currentNode.label, regex); // if the regex doesn't match any part of `currentNode.label` or, the entire string
          splitResult.forEach((childSentence) => {
            childSentence = childSentence.trim();
            if (childSentence && childSentence !== currentNode.label) {
              // handle case of leading/trailing operators
              let lt_ops;
              for (let rx of lt_div_regexes) {
                const match = rx.exec(childSentence);
                if (match) {
                  const { l_operator, t_operator } = match.groups;
                  lt_ops = {
                    ...(l_operator && { l_operator }),
                    ...(t_operator && { t_operator }),
                  };
                  childSentence = childSentence.replace(rx, "");
                }
              }
              // generate new leaf node and add it to the stack to be recursively visited
              const newId = uuidv4();
              const newNode = {
                [this.node_id_key]: newId,
                label: childSentence.trim(), // TODO - `label` is hard-coded. Instead, use `this.node_label`
                operator: divider.operator,
                ...(lt_ops && { ...lt_ops }),
              };
              this.nodes.push(newNode);
              this.edges.push({ from: id, to: newId });
              stack.push(newNode);
            }
          });
        } else {
          // add child nodes to the stack for non-leaf nodes
          this.edges.forEach((edge) => {
            if (edge.from === id && !visited.has(edge.to)) {
              const childNode = this.nodes.find(
                (n) => n[this.node_id_key] === edge.to,
              );
              if (childNode) stack.push(childNode);
            }
          });
        }
      }
    }
  };

  splitLeafByFunc = (node, split_func) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateFunction(split_func);

    param_validator.validateString(node.label); // `this.node_label`
    if (!this.isNodeInDAG(node)) {
      throw new Error(
        `${
          this.constructor.name
        }.splitLeafByFunc - Invalid input. Expected node with ID ${
          node[this.node_id_key]
        } to be part of the DAG (Directed Acyclic Graph).`,
      );
    }

    if (!node.label) {
      return this;
    }

    let stack = [node];
    let visited = new Set();

    while (stack.length > 0) {
      let currentNode = stack.pop();
      let id = currentNode[this.node_id_key];
      currentNode.label = currentNode.label.trim();

      if (!visited.has(id)) {
        // mark node as visited
        visited.add(id);
        const isLeaf = !this.edges.some((edge) => edge.from === id);
        if (isLeaf) {
          const splitResult = split_func(currentNode.label);
          splitResult.forEach((childSentence) => {
            childSentence = childSentence.trim();
            if (childSentence && childSentence !== currentNode.label) {
              // handle case of leading/trailing operators
              let lt_ops;
              for (let rx of lt_div_regexes) {
                const match = rx.exec(childSentence);
                if (match) {
                  const { l_operator, t_operator } = match.groups;
                  lt_ops = {
                    ...(l_operator && { l_operator }),
                    ...(t_operator && { t_operator }),
                  };
                  childSentence = childSentence.replace(rx, "");
                }
              }
              // generate new leaf node and add it to the stack to be recursively visited
              const newId = uuidv4();
              const newNode = {
                id: newId,
                label: childSentence.trim(),
                operator: "()", // Hard-coded operator
                ...(lt_ops && { ...lt_ops }),
              };
              this.nodes.push(newNode);
              this.edges.push({ from: id, to: newId });
              stack.push(newNode);
            }
          });
        } else {
          // add child nodes to the stack for non-leaf nodes
          this.edges.forEach((edge) => {
            if (edge.from === id && !visited.has(edge.to)) {
              const childNode = this.nodes.find(
                (n) => n[this.node_id_key] === edge.to,
              );
              if (childNode) stack.push(childNode);
            }
          });
        }
      }
    }
  };

  setLeadTrailingOperator = (leafNodes, lt_dividers) => {
    param_validator.validateArray(leafNodes);
    param_validator.validateArray(lt_dividers);

    if (!lt_dividers.every((div) => div instanceof LeadTrailingDivider)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.setLeadTrailingOperator - Invalid input. Expected each element of lt_dividers to be an instance of LeadTrailingDivider. Instead, got ${typeof lt_dividers}`,
      );
    }

    leafNodes
      .filter((n) => n.operator === "()")
      .forEach((n) => {
        for (let lt_div of lt_dividers) {
          let rx = lt_div.tryRegExp();
          const match = rx.exec(n.label);
          if (match) {
            n.label = n.label.replace(rx, "").trim();
            n.operator = match.groups.l_operator ?? match.groups.t_operator; // TODO - need to account for: ") AND ("
          }
        }
      });
  };

  // utility methods (optional)
  // check if a node is part of the DAG
  isNodeInDAG = (node) => {
    return this.nodes.some(
      (n) => n[this.node_id_key] === node[this.node_id_key],
    );
  };

  addNode = (node, edge) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateKeyedObj(edge);

    if (!(this.node_id_key in node)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.addNode - Invalid input. Expected ${node} a keyed Object with, at least, the property ${
          this.node_id_key
        }. Instead, was passed ${typeOf(node)}`,
      );
    }
    if (!("from" in edge) || !("to" in edge)) {
      throw new TypeError(
        `${
          this.constructor.name
        }.addNode - Invalid input. Expected ${edge} to be a keyed Object with the properties:
        - from
        - to. Instead, was passed ${typeOf(edge)}`,
      );
    }

    this.nodes.push(node);
    this.edges.push(edge);

    // Optionally, update the root node if necessary
    if (!this.edges.some((e) => e.to === this.root_node[this.node_id_key])) {
      this.root_node = this.nodes.find(
        (n) => !this.edges.some((e) => e.to === n[this.node_id_key]),
      );
    }
  };

  removeNode = (node_id) => {
    this.nodes = this.nodes.filter(
      (node) => node[this.node_id_key] !== node_id,
    );
    this.edges = this.edges.filter(
      (edge) => edge.from !== node_id && edge.to !== node_id,
    );
  };

  getRootNode = () => {
    /* callback checks if there is no edge where the `to` property matches the current node's id.
        If, at least, one edge points to the current node, then it means that the current node has a parent.
        If not, current node is root node */
    return this.nodes.find(
      (node) => !this.edges.some((edge) => edge.to === node[this.node_id_key]),
    );
  };

  getLeafNodes = () => {
    return this.nodes.filter(
      (node) =>
        !this.edges.some((edge) => edge.from === node[this.node_id_key]),
    );
  };

  findNode = (id) => {
    return (
      this.nodes.find(
        (node) => node[this.node_id_key] === id || node.value === id,
      ) || null
    );
  };

  findChildren = (node_id) => {
    return this.edges
      .filter((edge) => edge.from === node_id)
      .map((edge) => edge.to);
  };

  // TODO - verify or decommission
  toHierarchicalTree = () => {
    const buildTree = (node_id) => {
      const node = this.findNode(node_id);
      return {
        ...{
          child_entries: this.findChildren(node_id).map(buildTree),
        },
        ...node,
      };
    };
    return buildTree(this.root_node[this.node_id_key]);
  };

  /**
   * @description Traverses the collections of nodes and edges to return the path from the root node to a given target node.
   *
   * @param {Object} target_node - The target node for which the path is to be found.
   * @returns {Array} An array of segments of the path from the root node to the target node in dot notation.
   */
  getPathToNode = (target_node) => {
    param_validator.validateKeyedObj(target_node);

    if (!this.nodes.length) {
      throw new TypeError(
        `${this.constructor.name}.getPathToNode - Invalid input. Expected a Nodes collection`,
      );
    }

    const node_map = new Map(
      this.nodes.map((node) => [node[this.node_id_key], node]),
    );
    const edge_map = new Map(this.edges.map((edge) => [edge.to, edge.from]));

    const target_node_id = target_node[this.node_id_key];

    if (!node_map.has(target_node_id)) {
      console.error(
        `${this.constructor.name}.getPathToNode - Target node ${target_node} with id ${target_node_id} not found in nodes collection`,
      );
    }

    let current_node_id = target_node_id;
    const path_segments = [current_node_id];

    while (edge_map.has(current_node_id)) {
      current_node_id = edge_map.get(current_node_id);
      path_segments.unshift(current_node_id);
    }

    return path_segments;
  };

  /**
   * @description Traverses the collections of nodes and edges to return the path from the root node to a given target node.
   *
   * @param {Object} target_node - The target node for which the path is to be found.
   * @param {string} seg_key - The key of the property that stores the segment used to reconstitute the path.
   * @param {string} id_key - The key of the property that stores the ID of the node.
   * @returns {Array} An array of segments of the path from the root node to the target node.
   * Alert console if the target node is not found in the nodes collection.
   * @throws {TypeError} If the target node is not a keyed Object.
   */
  getPathToNodeBy = (
    target_node,
    seg_key = this.node_name_key,
    id_key = this.node_id_key,
  ) => {
    param_validator.validateKeyedObj(target_node);
    param_validator.validateStringIsNotEmpty(seg_key);
    param_validator.validateStringIsNotEmpty(id_key);

    const nodes = this.nodes;
    const edges = this.edges;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      throw new TypeError(
        `${this.constructor.name}.getPathToNodeBy - Invalid input. Expected:
            - ${nodes} to be an Array of keyed Objects. Instead, was passed ${typeOf(
              nodes,
            )}
            - ${edges} to be an Array. Instead, was passed ${typeOf(edges)}`,
      );
    }

    const node_map = new Map(nodes.map((node) => [node[id_key], node]));
    const edge_map = new Map(edges.map((edge) => [edge.to, edge.from]));

    const target_node_id = target_node[id_key];

    if (!node_map.has(target_node_id)) {
      console.warn(
        `${this.constructor.name}.getPathToNodeBy() - Target node identified by ${id_key} with ID ${target_node_id} not found in nodes collection`,
      );
      return undefined;
    }

    let curr_node_id = target_node_id;
    const path_segments = [node_map.get(curr_node_id)[seg_key]];

    while (edge_map.has(curr_node_id)) {
      curr_node_id = edge_map.get(curr_node_id);
      path_segments.unshift(node_map.get(curr_node_id)[seg_key]);
    }

    return path_segments;
  };

  /**
   * @description Converts a collection of nodes and edges into a tree structure by linking children to their parent nodes.
   * The method uses the specified child property to create the tree and optionally keeps or removes node IDs.
   *
   * @param {string} [child_entries_key=this.child_entries_key] - The property name to use for child nodes.
   * @param {boolean} [is_kept_id=false] - A flag indicating whether to keep the node IDs in the resulting tree.
   * @returns {Object} The root node of the constructed tree.
   * @throws {TypeError} If the inputs are not of the expected types.
   * @throws {Error} If the root node is not found.
   */
  toNodeTreeBy = (
    child_entries_key = this.child_entries_key,
    is_kept_id = false,
  ) => {
    param_validator.validateStringIsNotEmpty(child_entries_key);
    param_validator.validateBoolean(is_kept_id);

    const nodes = this.nodes;
    const edges = this.edges;

    const root_node = this.getRootNode();
    if (!root_node) {
      throw new Error(
        `${this.constructor.name}.toNodeTreeBy() - Root node not found`,
      );
    }

    const node_map = new Map();
    nodes.forEach((node) => {
      node[child_entries_key] = [];
      node_map.set(node[this.node_id_key], node);
    });

    // build the tree by linking children to their parent
    edges.forEach(({ from, to }) => {
      const parent_node = node_map.get(from);
      const child_node = node_map.get(to);
      if (!is_kept_id) {
        delete parent_node[this.node_id_key];
        delete child_node[this.node_id_key];
      }
      if (parent_node && child_node) {
        parent_node[child_entries_key].push(child_node);
      }
    });
    return root_node;
  };
}
