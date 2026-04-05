import { getContent } from "./get-content.js";

export async function getConcatenatedFileContents(event) {
  /* with `addEventListener()`, the value of `this` inside the handler will be a reference to the element.
  Thus, `this === event.currentTarget` https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler */
  const contents = [];
  for await (const file of event.currentTarget.files) {
    contents.push(await getContent(file));
  } // `event.currentTarget.files` returns a `FileList` object, which enable a web application to retrieve individual `File` objects (https://developer.mozilla.org/en-US/docs/Web/API/File_API)
  return contents.flat();
}
