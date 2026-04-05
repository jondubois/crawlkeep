export function JSONtoURI(jdat) {
  return Object.entries(jdat)
    .map((kv) => `&${kv[0]}=${kv[1]}`)
    .reduce((a, b) => a + b)
    .replace(/^\&/, "?");
}
