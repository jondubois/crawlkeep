/**
 * @description Extracts the content of an HTML table with a target ID, and returns it as a 2D array of strings,
 * where each inner array represents a row and each string represents a cell's content.
 * The content is sanitized by removing newlines, replacing double spaces, and escaping double quotes for CSV compatibility.
 *
 * @param {string} table_id - The ID of the HTML table to extract content from.
 * @return {string[][]} A 2D array containing the table's content. Each inner array represents a row,
 * and each string represents a cell's content. Returns an empty array if the table is not found.
 */
export function getTableContent(table_id) {
  const table = document.getElementById(table_id);
  if (!table) {
    console.error(`Table with ID "${table_id}" not found.`);
    return [];
  }

  const rows = table.querySelectorAll("tr");
  const tableContent = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td, th");
    const rowData = [];

    cells.forEach((cell) => {
      let cellText = cell.innerText
        // remove newlines
        .replace(/(\r\n|\n|\r)/gm, "")
        // replace double spaces
        .replace(/(\s\s)/gm, " ")
        // escape double quotes
        .replace(/"/g, '""');
      rowData.push(`"${cellText}"`); // wraps in quotes for CSV compatibility
    });

    if (rowData.length > 0) {
      tableContent.push(rowData);
    }
  });

  return tableContent;
}

// // Example usage:
// const table_id = "transactionsTable";
// const content = getTableContent(table_id);
// console.log(content);
