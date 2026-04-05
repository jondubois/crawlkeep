/**
 * @description Inserts a source node, containing text, within a target text node at a specified index.
 * @param {TextNode} target - The text node to modify
 * @param {Node} source - The DOM node to insert
 * @param {Integer} i - Index where to insert the source at
 * @return {Node} source - The newly created node: `source` after it's modified
 */
export function insertTextNodeWithin(target, source, i) {
  if (
    target.nodeType !== Node.TEXT_NODE ||
    !(source instanceof Node) ||
    !Number.isInteger(i)
  ) {
    throw new TypeError(
      `${insertTextNodeWithin1.name} - Invalid input. Expected:
          - ${
            arguments[0]
          } to be a TextNode. Instead, was passed ${typeof arguments[0]},
          - ${
            arguments[1]
          } to be a DOM Node. Instead, was passed ${typeof arguments[1]},
          - ${
            arguments[2]
          } to be an Integer. Instead, was passed ${typeof arguments[2]}`,
    );
  }
  if (i < 0 || !target.data.length) {
    throw new RangeError(`${insertTextNodeWithin.name} is out of bounds.`);
  } /* `.data` property is specific to Text, Comment, and ProcessingInstruction nodes.
    Whereas `.textContent` returns the text content of the element and that of all its child nodes */

  const source_text_length =
    source.nodeType === Node.TEXT_NODE
      ? source.data.length
      : source.textContent.length; // /!\ haven't checked what happens in case `source` has child nodes

  if (source_text_length <= 0) return target;

  // Split the target text node, between the specified index and the end of the text content of the source,
  // into three text nodes: one before the index, one at end of the text to insert, and one after the index
  const before_text_node = target.splitText(i); // https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
  before_text_node.splitText(source_text_length);

  // substitute the content of the target, with the newly created insertion
  before_text_node.parentNode.replaceChild(source, before_text_node);

  return source;
}

/**
 * Inserts a text, embedded in a source node, within a target text node at a specified index.
 * @param {TextNode} target - The text node to modify
 * @param {Node} source - The DOM node to insert
 * @param {String} text_to_insert - The text to insert
 * @param {Integer} i - Index where to insert the source at
 * @return {Node} source - The newly created node: `source` after it's modified
 */
export function insertTextNodeWithin1(target, source, text_to_insert, i) {
  if (
    target.nodeType !== Node.TEXT_NODE ||
    !(source instanceof Node) ||
    typeof text_to_insert !== "string" ||
    !Number.isInteger(i)
  ) {
    throw new TypeError(
      `${insertTextNodeWithin1.name} - Invalid input. Expected:
          - ${
            arguments[0]
          } to be a TextNode. Instead, was passed ${typeof arguments[0]},
          - ${
            arguments[1]
          } to be a DOM Node. Instead, was passed ${typeof arguments[1]},
          - ${
            arguments[2]
          } to be a String. Instead, was passed ${typeof arguments[2]},
          - ${
            arguments[3]
          } to be an Integer. Instead, was passed ${typeof arguments[3]}`,
    );
  }
  if (i < 0 || !target.data.length) {
    throw new RangeError(`${insertTextNodeWithin1.name} is out of bounds.`);
  } // `.data` property is specific to Text, Comment, and ProcessingInstruction nodes. Whereas `.textContent` returns the text content of the element and that of all its child nodes

  if (text_to_insert === "") return target;

  // Split the target text node, between the specified index and the end of the text content of the source,
  // into three text nodes: one before the index, one at end of the text to insert, and one after the index
  const before_text_node = target.splitText(i); // https://developer.mozilla.org/en-US/docs/Web/API/Text/splitText
  before_text_node.splitText(text_to_insert.length);
  source.appendChild(before_text_node.cloneNode(true)); // deep clone, even though a TextNode has no children

  // substitute the content of the target, with the newly created insertion
  before_text_node.parentNode.replaceChild(source, before_text_node);

  return source;
}
