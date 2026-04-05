export function inlineStyler(elm, css) {
  if (elm) {
    Object.entries(
      JSON.parse(
        css
          .replace(/(?<=:)\s*(\b|\B)(?=.+?;)/g, '"')
          .replace(/(?<=:\s*.+?);/g, '",')
          .replace(/[a-zA-Z-]+(?=:)/g, (k) =>
            k.replace(/^\b/, '"').replace(/\b$/, '"'),
          )
          .replace(/\s*,\s*}/g, "}"),
      ),
    ).forEach((kv) => {
      elm.style.setProperty([kv[0]], kv[1], "important");
    });
  }
}
