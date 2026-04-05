/**
 * @description Calculates the bounding rectangle of a target HTML element or a selected area.
 * - For tables/tbody, row and column indices can be specified to get the boundaries of a targeted cell selection.
 * - For other elements, returns the element's bounding rectangle as a DOMRect or DOMRect-like object.
 *
 * @param {HTMLElement} target - The target HTML element (e.g., table, tbody, or any other element).
 * @param {Object} [areaSelection={}] - Optional selection for tables/tbody.
 * @param {number[]} [areaSelection.rowIndices] - 1-based indices of rows to include in the boundary calculation (defaults to all rows).
 * @param {number[]} [areaSelection.colIndices] - 1-based indices of columns to include in the boundary calculation (defaults to all columns).
 *
 * @returns {DOMRect|Object} A DOMRect or DOMRect-like object (with left, top, right, bottom, width, height, x, y).
 * Returns an empty object if no cells are found for the selection.
 */
export function getBoundaries(target, areaSelection = {}) {
  switch (target.tagName?.toLowerCase()) {
    case "table":
    case "tbody": {
      const { rowIndices = [], colIndices = [] } = areaSelection; // 1-based indices
      const rows = Array.from(target.querySelectorAll("tr"));
      if (!rows.length) return {};

      // default to all rows if rowIndices is empty
      const rowIdxs = rowIndices.length
        ? rowIndices
        : rows.map((_, i) => i + 1);

      // default to all columns if colIndices is empty
      const colCount = rows[0]?.children.length || 0;
      const colIdxs = colIndices.length
        ? colIndices
        : Array.from({ length: colCount }, (_, i) => i + 1);

      const cells = [];
      rowIdxs.forEach((rIdx) => {
        const row = rows[rIdx - 1];
        if (row) {
          colIdxs.forEach((cIdx) => {
            const cell = row.querySelector(`td:nth-child(${cIdx})`);
            if (cell) cells.push(cell);
          });
        }
      });

      if (!cells.length) return {};
      const rects = cells.map((cell) => cell.getBoundingClientRect());
      const left = Math.min(...rects.map((r) => r.left));
      const top = Math.min(...rects.map((r) => r.top));
      const right = Math.max(...rects.map((r) => r.right));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const width = right - left;
      const height = bottom - top;
      const x = left;
      const y = top;
      // Return a DOMRect-like object
      return { left, top, right, bottom, width, height, x, y };
    }
    default: {
      return target.getBoundingClientRect();
    }
  }
}