function tryJson(param_str) {
  try {
    return JSON.parse(param_str); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent#decoding_query_parameters_from_a_url
  } catch (error) {
    console.error(
      `Whilst processing ${tryJson.name} - Error sending message to background script:`,
      error,
    );
    return param_str;
  }
}

export function parseUriAsJson(url, obj) {
  const query_params = url.match(/(?<=\?|&)\S+?(?=&|$)/g); // returns null if no matches are found
  if (query_params) {
    query_params
      .map((param) => (param ? param.split(/=/) : [[]]))
      .reduce((acc, param) => {
        const [key, value] = param;
        const decoded_param_str = decodeURIComponent(value.replace(/\+/g, " "));
        acc[key] = tryJson(decoded_param_str);
        return acc;
      }, obj);
  }
  return obj;
}

// function parseURIasJSON(url, obj) {
//   function tryJSON(s) {
//     try {
//       return JSON.parse(decodeURIComponent(s));
//     } catch (err) {
//       console.log(err);
//       return s;
//     }
//   }
//   if (url.match(/(?<=\?|&)\S+?(?=&|$)/g)) {
//     url
//       .match(/(?<=\?|&)\S+?(?=&|$)/g)
//       .map((r) => (r ? r.split(/=/) : [[]]))
//       .forEach((r) => (obj[r[0]] = tryJSON(r[1])));
//   }
//   return obj;
// }
