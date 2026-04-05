import { toPascalCase, toTextFrom } from "../../../core/manip-str/index.js";
import { createAndAppendDtDdAnchorTo } from "./create-and-append-dt-dd-anchor-to.js";
import { createAndAppendDtDdTo } from "./create-and-append-dt-dd-to.js";

/**
 * @description Updates the content of specified card containers by mapping card properties to DOM elements.
 * For each mapping, replaces the container's children with new <dt>/<dd> pairs or anchor elements,
 * depending on whether the value is a URL.
 *
 * @param {Object} card - The card object containing properties to display.
 * @param {Array<[string, string]>} mapping - An array of [property, containerId] pairs to map card properties to DOM containers.
 */
export function updateCardContentDl(card, mapping) {
  mapping.forEach(([prop, containerId]) => {
    const container = document.getElementById(containerId);
    if (!container || !card[prop]) return;
    container.replaceChildren();

    Object.keys(card[prop]).forEach((key) => {
      const value = card[prop][key];
      if (!value) return;
      const class_name = containerId.replace("-list", "");
      if (/^https?:\/\//.test(value)) {
        createAndAppendDtDdAnchorTo(container, {
          class_name,
          term: toTextFrom(toPascalCase(key)),
          url: value,
          is_wrapped: false,
        });
      } else {
        createAndAppendDtDdTo(container, {
          class_name,
          term: toTextFrom(toPascalCase(key)),
          description: value,
          is_wrapped: false,
        });
      }
    });
  });
}
