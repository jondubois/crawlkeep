export function topZIndexer() {
  let n = new Date().getTime() / 1000000;
  let r = (n - Math.floor(n)) * 100000;
  return Math.ceil(n + r) * 10;
}

export function topIndexHover() {
  this.style.zIndex = topZIndexer();
}
