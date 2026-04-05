/**
 * @description Sets multiple CSS styles on a specified HTML element using its inline style attribute.
 * @param {HTMLElement} elm - The HTML element on which to set the styles.
 * @param {string} css - The CSS styles to set, in the format of a CSS block, but with the rules separated by semicolons.
 * @returns {void}
 */
export function inlineStyler(elm, css) {
  if (elm) {
    Object.entries(
      JSON.parse(
        css
          .replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g, '"')
          .replace(/(?<=:\s*.+?);/g, '",')
          .replace(/[a-zA-Z-]+(?=:)/g, (k) =>
            k.replace(/^\b/, '"').replace(/\b$/, '"'),
          )
          .replace(/\s*,\s*}/g, "}"),
      ),
    ).forEach((kv) => {
      elm.style.setProperty([kv[0]], kv[1], "important");
    });
  }
}
