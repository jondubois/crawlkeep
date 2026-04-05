export function isValidElm(node) {
  let not_hidden_class = !Array.from(node.classList || [])?.some(
    (c) => c === "visually-hidden" || c === "xh_text_elm",
  );
  return (
    node &&
    node.nodeType === 1 &&
    node.childNodes &&
    not_hidden_class &&
    !/(meta|img|script|style|svg|audio|canvas|figure|video|select|input|textarea)/i.test(
      node.tagName,
    ) &&
    node.visible()
  );
}
