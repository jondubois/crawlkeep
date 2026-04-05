export function toFileFormat(array, filename) {
  // there are two parts to a file name: the name and the extension (https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files)
  const extension = filename.split(".").pop().toLowerCase();
  let data;
  let type;

  switch (extension) {
    case "json":
      data = JSON.stringify(array, null, 2);
      type = "data:application/json;charset=utf-8,";
      break;
    case "csv":
      data = array.map((row) => row.join(",")).join("\n");
      type = "data:text/csv;charset=utf-8,";
      break;
    case "tsv":
      data = array.map((row) => row.join("\t")).join("\n");
      type = "data:text/tab-separated-values;charset=utf-8,";
      break;
    case "txt":
    default:
      data = array.map((row) => row.join("    ")).join("\n");
      type = "data:text/plain;charset=utf-8,";
      break;
  }

  return { data, type };
}
