//  encoding / decoding
export const btoaJSON = (s) => btoa(encodeURIComponent(JSON.stringify(s)));
export const atobJSON = (s) => JSON.parse(decodeURIComponent(atob(s)));
