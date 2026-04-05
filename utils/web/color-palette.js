export const main_app_colors = {
  bg_color: "#772ce8",
  bg_highlight: "#9968e3",
  bg_light_grey: "#f4f4f4",
  bg_rgba_purple: "rgba(119, 44, 232, 1)",
  bg_rgba_02: "rgba(119, 44, 232, 0.2)",
  bg_rgba_08: "rgba(119, 44, 232, 0.8)",
  bg_rgba_26: "rgba(26, 26, 26, 0.89)",
  bg_black: "#000000",
  bg_shadow: "#5a1aba",
  body_bg: "#bdbbbb",
  body_border: "#ccc",
  border: "#1a1a1a",
  light_fade: "#e6ebed",
  light_purple: "#e0d6f1",
  placeholder: "#4d4f4f", // light violet: "#cdc3db",
  shadow:
    "rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px",
  text: "#1c1c1c", // #1c1d1f
  text_white: "#FFFFFF",
};

export const main_background_gradient =
  `linear-gradient(135deg, ${main_app_colors.bg_color}80 0%, ${main_app_colors.bg_color} 0%, ${main_app_colors.bg_color} 95%, ${main_app_colors.bg_color}80 98%)`
    .replace(/\n/g, "")
    .replace(/\s+/g, " "); // https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient

export const svgs = {
  link_svg: `<svg viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g viewBox="0 0 36 36"><circle cx="18" cy="18" r="17.5" stroke="#E7E7E7" fill="#F4F4F4" stroke-width=".5"></circle><path d="m21.41,23.29l-0.71,-0.71l4.59,-4.58l-4.59,-4.59l0.71,-0.71l5.3,5.3l-5.3,5.29zm-6.12,-0.7l-4.58,-4.59l4.59,-4.59l-0.71,-0.7l-5.3,5.29l5.29,5.29l0.71,-0.7z" fill="#606060" ></path></g></svg>`,
  dl_svg: `<svg viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"></path></svg>`,
  clipper: `<svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1bgeryd-1 ifdSJl"><g><path d="M14.594 4.495l-.585-1.91L15.922 2l.585 1.91-1.913.585zM11.14 3.46l.585 1.911 1.913-.584-.585-1.91-1.913.583zM8.856 6.247l-.584-1.91 1.912-.584.585 1.91-1.913.584zM5.403 5.213l.584 1.91L7.9 6.54l-.585-1.911-1.912.584zM2.534 6.09L3.118 8l1.913-.584-.585-1.91-1.912.583zM5 9H3v7a2 2 0 002 2h10a2 2 0 002-2V9h-2v7H5V9z"></path><path d="M8 9H6v2h2V9zM9 9h2v2H9V9zM14 9h-2v2h2V9z"></path></g></svg>`,
  close: `<svg style="border-radius: 2em; height: 30px; width: 30px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="${main_app_colors.bg_color}" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"/></svg>`,
  hidden: `<svg style="height:35px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect x="0" fill="none"/><g><path d="M17.3 3.3c-.4-.4-1.1-.4-1.6 0l-2.4 2.4c-1.1-.4-2.2-.6-3.3-.6-3.8.1-7.2 2.1-9 5.4.2.4.5.8.8 1.2.8 1.1 1.8 2 2.9 2.7L3 16.1c-.4.4-.5 1.1 0 1.6.4.4 1.1.5 1.6 0L17.3 4.9c.4-.5.4-1.2 0-1.6zm-10.6 9l-1.3 1.3c-1.2-.7-2.3-1.7-3.1-2.9C3.5 9 5.1 7.8 7 7.2c-1.3 1.4-1.4 3.6-.3 5.1zM10.1 9c-.5-.5-.4-1.3.1-1.8.5-.4 1.2-.4 1.7 0L10.1 9zm8.2.5c-.5-.7-1.1-1.4-1.8-1.9l-1 1c.8.6 1.5 1.3 2.1 2.2C15.9 13.4 13 15 9.9 15h-.8l-1 1c.7-.1 1.3 0 1.9 0 3.3 0 6.4-1.6 8.3-4.3.3-.4.5-.8.8-1.2-.3-.3-.5-.7-.8-1zM14 10l-4 4c2.2 0 4-1.8 4-4z" fill="${main_app_colors.bg_color}"/></g></svg>`,
  calendar: `<svg width="100%" height="100%" viewBox="0 0 512 512" version="1.1"><g style="" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="scheduler" fill="#ffffff"><path d="M384,1.42108547e-14 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L384,1.42108547e-14 Z M341.333333,128 L42.6666667,128 L42.6666667,341.333333 L341.333333,341.333333 L341.333333,128 Z M128,256 L128,298.666667 L85.3333333,298.666667 L85.3333333,256 L128,256 Z M213.333333,256 L213.333333,298.666667 L170.666667,298.666667 L170.666667,256 L213.333333,256 Z M298.666667,256 L298.666667,298.666667 L256,298.666667 L256,256 L298.666667,256 Z M128,170.666667 L128,213.333333 L85.3333333,213.333333 L85.3333333,170.666667 L128,170.666667 Z M213.333333,170.666667 L213.333333,213.333333 L170.666667,213.333333 L170.666667,170.666667 L213.333333,170.666667 Z M298.666667,170.666667 L298.666667,213.333333 L256,213.333333 L256,170.666667 L298.666667,170.666667 Z M341.333333,42.6666667 L42.6666667,42.6666667 L42.6666667,85.3333333 L341.333333,85.3333333 L341.333333,42.6666667 Z" id="Combined-Shape"></path></g></g></svg>`,
  resize: `<svg xmlns="http://www.w3.org/2000/svg" style="height: 30px; width: 30px; transform:translate(-3px,-3px);" viewBox="0 0 24 24" fill="none"><path d="M21 15L15 21M21 8L8 21" stroke="${main_app_colors.body_bg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pip_svg: `<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-135"></use><path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="#fff" id="ytp-id-135"></path></svg>`,
  streams: `<svg width="30px" height="30px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" class="ScIconSVG-sc-1bgeryd-1 ifdSJl"><g><path d="M17 8.268a2 2 0 11-2 0V2h2v6.268zM15 14v4h2v-4h-2zM12 6a2 2 0 00-1-1.732V2H9v2.268A2 2 0 1012 6zM9 10v8h2v-8H9zM3 8.268V2h2v6.268a2 2 0 11-2 0zM3 14v4h2v-4H3z"></path></g></svg>`,
  three_line: `<svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 50 50" width="22px" height="22px"><path d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"/></svg>`,
  play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.46484 3.92349C4.79896 3.5739 4 4.05683 4 4.80888V19.1911C4 19.9432 4.79896 20.4261 5.46483 20.0765L19.1622 12.8854C19.8758 12.5108 19.8758 11.4892 19.1622 11.1146L5.46484 3.92349ZM2 4.80888C2 2.55271 4.3969 1.10395 6.39451 2.15269L20.0919 9.34382C22.2326 10.4677 22.2325 13.5324 20.0919 14.6562L6.3945 21.8473C4.39689 22.8961 2 21.4473 2 19.1911V4.80888Z" fill="${main_app_colors.bg_color}"/>
    </svg>`,
  partner: `<svg width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" d="m10 2 6 2 2 6-2 6-6 2-6-2-2-6 2-6 6-2ZM8.889 13.636l5.43-5.429-1.415-1.414-4.015 4.015-2.015-2.015-1.414 1.414 3.429 3.43Z" clip-rule="evenodd"></path></svg>`,
};
