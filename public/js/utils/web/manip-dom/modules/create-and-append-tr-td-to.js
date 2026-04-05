import { splitToSentences, toHtmlList } from "../../../core/manip-str/index.js";

/**
 * @description Creates and appends a table row with term and description cells to a parent table body element
 * @param {HTMLElement} parent_cont - The table body element to append the row to
 * @param {Object} config - Configuration object containing row data
 * @return {Object} Returns an object containing references to the created .
 */
export function createAndAppendTrTdTo(parent_cont, config) {
  const { class_name, term, description, tdFormatting } = config;
  // Type checks
  if (typeof term !== "string" || typeof description !== "string") return;

  if (!term && !description) return;

  const tr = document.createElement("tr");
  if (class_name) tr.classList.add(class_name);

  const td = document.createElement("td");
  td.classList.add("display-text", "key", class_name);
  td.textContent = term;

  const td_description = document.createElement("td");
  td_description.classList.add("display-text", "value", class_name);
  if (tdFormatting) {
    td_description.innerHTML = splitToSentences(String(description))
      .map((sentence) => toHtmlList(sentence))
      .join("");
  } else {
    td_description.textContent = description;
  }
  tr.appendChild(td);
  tr.appendChild(td_description);
  parent_cont.appendChild(tr);
  return { tr, td, td_description };
}
