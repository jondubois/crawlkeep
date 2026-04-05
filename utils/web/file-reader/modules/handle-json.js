export function handleJson(event) {
  const json_arr = JSON.parse(event.currentTarget.result);
  return Array.isArray(json_arr) ? json_arr : [json_arr];
}
