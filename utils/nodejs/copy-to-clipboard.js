import { exec } from "child_process";
import param_validator from "../../classes/modules/param-validator.js";

/**
 * Copies a stringified JSON to the clipboard, populating only specific keys.
 * @param {string} str_text - The stringified JSON to be copied to the clipboard.
 */
export function copyToClipboard(str_text) {
  param_validator.validateString(str_text);

  try {
    let process = exec("clip");
    process.stdin.write(str_text);
    process.stdin.end();
    console.log("Copied to clipboard");
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing copyToClipboard(), Error: ${error.message}`;
    throw error;
  }
}

// // Usage
// copyToClipboard(JSON.stringify(object, null, 2));

/* INCORRECT, YET WORKS */
// function copyToClipboard(str_text, arr_props, num_indentation) {
//   exec("clip").stdin.end(str_text, arr_props, num_indentation);
// }

/**
 * Copies a text to the clipboard from the DevTools.
 * In Chromium browsers, writing requires either the clipboard-read permission or transient activation.
 * @param {string} text - The text to be written to the clipboard.
 * @returns {Promise} A promise that resolves when the text is successfully written to the clipboard.
 */
async function tryCopyToCB(text) {
  const _asyncCopy = async () => await navigator.clipboard.writeText(text);

  window.addEventListener("focus", _asyncCopy, {
    once: true,
  }); /* 
      `_asyncCopy` is a single-purpose callback, only intended to be used within the scope of `tryCopyToCB`. To improve readability:
      - in `_asyncCopy`, the prefix `_` is used to indicate that it's a private function,
      - a lambda expression was preferable to a function declaration to avoid nested functions
      (ie. having to declare `_asyncCopy` outside of `tryCopyToCB`). 
      An async function inherently returns a Promise. Therefore, wrapping it into another Promise was redundant.
      ```
      } finally {
        window.removeEventListener("focus", _asyncCopy);
      }
      ```
      was cut as, `once` option automatically removes the event listener after the first call.
      The `try..catch` block was unnecessary because it simply catched the error then,
      rethrew it without any additional handling. If an error occurs, 
      it's naturally propagated up aka "bubbled up" to the caller of the function `writeToClipboardFromDevTools`,
      which is delegated the responsibility of handling the error within its `try..catch` block. */
  console.log(
    `Click anywhere on the page to be scraped or,
      hit <Tab> to shift focus to "document" (otherwise, it throws a DOMException);`,
  );
}

export async function writeToClipboardFromDevTools(text) {
  try {
    await tryCopyToCB(text);
    console.log("Text successfully copied to the clipboard.");
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing writeToClipboardFromDevTools(), Error: ${error.message}`;
    throw error;
  }
}

/**
 * https://www.ikea.com/au/en/purchases/9900377000500062170224/
 */
// ("use strict");

// var deselectCurrent = require("toggle-selection");

// var clipboardToIE11Formatting = {
//   "text/plain": "Text",
//   "text/html": "Url",
//   default: "Text",
// };

// var defaultMessage = "Copy to clipboard: #{key}, Enter";

// function format(message) {
//   var copyKey = (/mac os x/i.test(navigator.userAgent) ? "⌘" : "Ctrl") + "+C";
//   return message.replace(/#{\s*key\s*}/g, copyKey);
// }

// function copyToClipboard1(text, options) {
//   var debug,
//     message,
//     reselectPrevious,
//     range,
//     selection,
//     mark,
//     success = false;
//   if (!options) {
//     options = {};
//   }
//   debug = options.debug || false;
//   try {
//     reselectPrevious = deselectCurrent();

//     range = document.createRange();
//     selection = document.getSelection();

//     mark = document.createElement("span");
//     mark.textContent = text;
//     // avoid screen readers from reading out loud the text
//     mark.ariaHidden = "true";
//     // reset user styles for span element
//     mark.style.all = "unset";
//     // prevents scrolling to the end of the page
//     mark.style.position = "fixed";
//     mark.style.top = 0;
//     mark.style.clip = "rect(0, 0, 0, 0)";
//     // used to preserve spaces and line breaks
//     mark.style.whiteSpace = "pre";
//     // do not inherit user-select (it may be `none`)
//     mark.style.webkitUserSelect = "text";
//     mark.style.MozUserSelect = "text";
//     mark.style.msUserSelect = "text";
//     mark.style.userSelect = "text";
//     mark.addEventListener("copy", function (e) {
//       e.stopPropagation();
//       if (options.format) {
//         e.preventDefault();
//         if (typeof e.clipboardData === "undefined") {
//           // IE 11
//           debug && console.warn("unable to use e.clipboardData");
//           debug && console.warn("trying IE specific stuff");
//           window.clipboardData.clearData();
//           var format =
//             clipboardToIE11Formatting[options.format] ||
//             clipboardToIE11Formatting["default"];
//           window.clipboardData.setData(format, text);
//         } else {
//           // all other browsers
//           e.clipboardData.clearData();
//           e.clipboardData.setData(options.format, text);
//         }
//       }
//       if (options.onCopy) {
//         e.preventDefault();
//         options.onCopy(e.clipboardData);
//       }
//     });

//     document.body.appendChild(mark);

//     range.selectNodeContents(mark);
//     selection.addRange(range);

//     var successful = document.execCommand("copy");
//     if (!successful) {
//       throw new Error("copy command was unsuccessful");
//     }
//     success = true;
//   } catch (err) {
//     debug && console.error("unable to copy using execCommand: ", err);
//     debug && console.warn("trying IE specific stuff");
//     try {
//       window.clipboardData.setData(options.format || "text", text);
//       options.onCopy && options.onCopy(window.clipboardData);
//       success = true;
//     } catch (err) {
//       debug && console.error("unable to copy using clipboardData: ", err);
//       debug && console.error("falling back to prompt");
//       message = format("message" in options ? options.message : defaultMessage);
//       window.prompt(message, text);
//     }
//   } finally {
//     if (selection) {
//       if (typeof selection.removeRange === "function") {
//         selection.removeRange(range);
//       } else {
//         selection.removeAllRanges();
//       }
//     }

//     if (mark) {
//       document.body.removeChild(mark);
//     }
//     reselectPrevious();
//   }

//   return success;
// }

// module.exports = copyToClipboard1;
