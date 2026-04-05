import { createElm } from "./set-elm.js";
import { gi } from "./get-elm.js";

/**
 * @description set the `<head>` of the HTML currently opened page,
 * insert a `<style>` element with
 * the `css_text` as its innerHTML.
 * @param {string} style_id - The ID to be used for the style element.
 * @param {string} css_text - The CSS to be inserted into the style element.
 */
export function setCSS(style_id, css_text) {
  const existing_css = gi(`${style_id}-style`);
  if (existing_css) existing_css.outerHTML = "";
  let css_elm = createElm("style");
  css_elm.setAttribute("id", `${style_id}-style`);
  // [["id", `${style_id}-style`]].forEach(([name, value]) =>
  //   setAttribute(css_elm, name, value),
  // );
  document.head.appendChild(css_elm);
  css_elm.innerHTML = css_text;
}
