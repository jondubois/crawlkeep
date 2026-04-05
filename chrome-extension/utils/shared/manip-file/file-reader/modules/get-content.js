import { loadHandleJson, loadHandleText } from "./handle-files.js";
/**
 * @description Reads the content of a file, based on its extension.
 * It supports JSON and text files; not yet XLSX.
 * @param {File} file - The file to be read and processed.
 * @return {Promise<any>} A promise that resolves with the content of the file as an Array or, rejects with an `Error` object.
 */
export async function getContent(file) {
  // `File` objects can be passed to `FileReader` objects to access the contents of the file (https://developer.mozilla.org/en-US/docs/Web/API/File_API)
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      const ext = file.name.split(".").pop().toLowerCase();

      reader.addEventListener("load", (event) => {
        let content;
        switch (ext) {
          case "json": {
            content = loadHandleJson(event);
            break;
          }
          case "txt": {
            content = [
              loadHandleText(reader.result, event),
            ]; /* When the read operation is complete, 
            the `readyState` property is changed to DONE, the `loadend` event is triggered, 
            and the `result` property contains the contents of the file as a text string (https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText ) */
            break;
          }
          // case "xlsx": {
          //   const workbook = XLSX.read(new Uint8Array(content), {
          //     type: "array",
          //   });
          //   const workbook_json = workbook.SheetNames.flatMap((sheetName) => {
          //     return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          //   });
          //   fileArray.push(...workbook_json);
          //   break;
          // }
          default: {
            reject(new Error(`Unsupported file extension: ${ext}`));
          }
        }
        resolve(content);
      });

      // async error handling
      reader.onerror = (event) => {
        console.error("Error reading file:", event.currentTarget.error);
        reject(event.currentTarget.error);
      };

      switch (ext) {
        case "json":
        case "txt": {
          reader.readAsText(file);
          break;
        }
        case "xlsx": {
          reader.readAsArrayBuffer(file);
          break;
        }
        default: {
          reject(new Error(`Unsupported file extension: ${ext}`));
          return; // whilst `reject` settles the Promise, it's a safeguard to prevent further execution
        }
      }
    } catch (error) {
      // sync error handling only; asynchronous errors do not bubble up
      console.error("Error initiating the reading of the file:", error);
      reject(error);
    }
  });
}
