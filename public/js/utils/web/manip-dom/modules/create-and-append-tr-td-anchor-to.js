/**
 * @description Creates a table row (<tr>) with two cells (<td>): one displaying a term and the other containing an anchor (<a>) linking to a URL, then appends the row to the specified parent container.
 * @param {HTMLElement} parent_cont - The parent container to which the table row will be appended.
 * @param {Object} config - Configuration object for the row and anchor.
 * @return {Object} Returns an object containing references to the created row, term cell, and link cell
 */
export function createAndAppendTrTdAnchorTo(parent_cont, config) {
  const { class_name, term, url, anchorConfig } = config;
  // Type checks
  if (typeof term !== "string") return;
  if (typeof url !== "string" && typeof anchorConfig?.href !== "string") return;

  if (!term || (!url && !anchorConfig?.href)) return;

  const row = document.createElement("tr");
  if (class_name) row.classList.add(class_name);

  const term_cell = document.createElement("td");
  term_cell.classList.add("display-text", "key", class_name);
  term_cell.textContent = term;

  const link_cell = document.createElement("td");
  link_cell.classList.add("display-text", "value", class_name);

  const anchor = document.createElement("a");
  anchor.target = "_blank";

  // Handle new object format with anchor attributes
  if (anchorConfig) {
    // Set href from anchorConfig
    anchor.href = anchorConfig.href;

    // Set anchor text based on source or href
    if (anchorConfig.source) {
      anchor.textContent = `View on ${anchorConfig.source}`;
    } else {
      anchor.textContent = anchorConfig.href;
    }

    // Set additional attributes if present
    if (anchorConfig.title) anchor.title = anchorConfig.title;
    if (anchorConfig.rel) anchor.rel = anchorConfig.rel;
    if (anchorConfig.target) anchor.target = anchorConfig.target;
  } else {
    // Handle legacy URL string format
    anchor.href = url;
    anchor.textContent = url;
  }

  link_cell.appendChild(anchor);
  row.appendChild(term_cell);
  row.appendChild(link_cell);
  parent_cont.appendChild(row);

  return { row, term_cell, link_cell, anchor };
}

/**
 * @description Creates a table row (<tr>) with two cells (<td>): one displaying a term and the other containing an anchor (<a>) linking to a URL, then appends the row to the specified parent container.
 * @param {HTMLElement} parent_cont - The parent container to which the table row will be appended.
 * @param {Object} config - Configuration object for the row and anchor.
 * @param {string} [config.class_name] - Optional class name to add to the row and cells.
 * @param {string} config.term - The text to display in the first cell.
 * @param {string} config.url - The URL for the anchor in the second cell.
 * @return {Object} Returns an object containing references to the created row, term cell, and link cell
 */
// export function createAndAppendTrTdAnchorTo(parent_cont, config) {
//   const { class_name, term, url } = config;

//   if (!term && !url) return;

//   const row = document.createElement("tr");
//   if (class_name) row.classList.add(class_name);

//   const term_cell = document.createElement("td");
//   term_cell.classList.add("display-text", "key", class_name);
//   term_cell.textContent = term;

//   const link_cell = document.createElement("td");
//   link_cell.classList.add("display-text", "value", class_name);

//   const anchor = document.createElement("a");
//   anchor.target = "_blank";
//   anchor.href = url;
//   anchor.textContent = url;
//   link_cell.appendChild(anchor);

//   row.appendChild(term_cell);
//   row.appendChild(link_cell);
//   parent_cont.appendChild(row);

//   return { row, term_cell, link_cell, anchor };
// }
