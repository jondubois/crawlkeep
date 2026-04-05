import { parseSearchStringAs3DimensionalRegexSet } from "../../../boolean-string-parser.js";
import { gi } from "../../../web/manip-dom/modules/get-elm.js";

export function highlightTerms(params) {
  var { text, elm, search } = params;
  var xrr = parseSearchStringAs3DimensionalRegexSet(search, "ig").flat();
  var matches = xrr
    .map((x) => {
      return Array.from(text.matchAll(x)).map((match) => {
        let word = match?.[0];
        let start_pos = match?.index;
        let end_pos =
          start_pos && match[0]?.length ? start_pos + match[0]?.length : null;
        return { word: word, start_pos: start_pos, end_pos: end_pos };
      });
    })
    .flat();

  var split_indexes = matches
    .sort((a, b) => (a.start_pos < b.start_pos ? -1 : 0))
    .map((r) => [r.start_pos, r.end_pos])
    .flat()
    .filter((r) => r);
  let xx = new RegExp(
    split_indexes.map((n) => `(?<=^.{${n}})`).reduce((a, b) => a + "|" + b),
  );
  // console.log(text.split(xx));
  var merged = text
    .split(xx)
    .map((str) =>
      matches.some((r) => r.word == str)
        ? `<span style="background-color: yellow;">${str}</span>`
        : str,
    )
    .reduce((a, b) => a + b);
  elm.innerHTML = merged;
}
highlightTerms({
  elm: gi("company_panel_viewer"),
  text: gi("company_panel_viewer").textContent,
  search: "engineer OR electr***",
});
