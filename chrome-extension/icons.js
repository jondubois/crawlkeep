var main_app_colors = {
  bg: /twitch\.tv/.test(window.location.href) ? "#772ce8" : "#104000",
  // #313538 9968e3
  text: "#1c1d1f",
  mid: /twitch\.tv/.test(window.location.href) ? "#e0d6f1" : "#dae8f5",
  light_fade: "#e6ebed88",
  placeholder: /twitch\.tv/.test(window.location.href) ? "#cdc3db" : "#bcd1e3",
  body_bg: "#ffffff",
  bg_highlight: /twitch\.tv/.test(window.location.href) ? "#9968e3" : "#45494d",
  bg_shadow: /twitch\.tv/.test(window.location.href) ? "#5a1aba" : "#1d2730",
};
main_app_colors["bg"] = "#1c1c1c";
var main_background_gradient =
  `linear-gradient(135deg, ${main_app_colors.bg_color}80 0%, ${main_app_colors.bg_color} 0%, ${main_app_colors.bg_color} 95%, ${main_app_colors.bg_color}80 98%)`
    .replace(/\n/g, "")
    .replace(/\s+/g, " ");

var svgs = {
  link_svg: `<svg viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g viewBox="0 0 36 36"><circle cx="18" cy="18" r="17.5" stroke="#E7E7E7" fill="#F4F4F4" stroke-width=".5"></circle><path d="m21.41,23.29l-0.71,-0.71l4.59,-4.58l-4.59,-4.59l0.71,-0.71l5.3,5.3l-5.3,5.29zm-6.12,-0.7l-4.58,-4.59l4.59,-4.59l-0.71,-0.7l-5.3,5.29l5.29,5.29l0.71,-0.7z" fill="#606060" ></path></g></svg>`,
  dl_svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" viewBox="0 0 1024 1024" class="icon" version="1.1"><path d="M512 791.466667L277.333333 512h469.333334zM426.666667 85.333333h170.666666v85.333334h-170.666666zM426.666667 213.333333h170.666666v85.333334h-170.666666z" fill="${
    main_app_colors.body_bg || "#1565C0"
  }"/><path d="M426.666667 341.333333h170.666666v234.666667h-170.666666zM128 " fill="${
    main_app_colors.body_bg || "#1565C0"
  }"/></svg>`,
  /*somthing is wrong with this SVG*/
  clipper: `<svg width="28px" height="28px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path fill="${main_app_colors.body_bg}" d="M14.594 4.495l-.585-1.91L15.922 2l.585 1.91-1.913.585zM11.14 3.46l.585 1.911 1.913-.584-.585-1.91-1.913.583zM8.856 6.247l-.584-1.91 1.912-.584.585 1.91-1.913.584zM5.403 5.213l.584 1.91L7.9 6.54l-.585-1.911-1.912.584zM2.534 6.09L3.118 8l1.913-.584-.585-1.91-1.912.583zM5 9H3v7a2 2 0 002 2h10a2 2 0 002-2V9h-2v7H5V9z"></path><path fill="${main_app_colors.body_bg}" d="M8 9H6v2h2V9zM9 9h2v2H9V9zM14 9h-2v2h2V9z"></path></g></svg>`,
  clipper_logo: `<svg width="28px" height="28px" version="1.1" viewBox="0 0 20 20" x="0px" y="0px" id="tvd_clipper_logo"><g>
        <path d="M14.594 4.495l-.585-1.91L15.922 2l.585 1.91-1.913.585z" class="left_vlogo vlogo" stroke="" stroke-width="" fill=""></path>
        <path d="M11.14 3.46l.585 1.911 1.913-.584-.585-1.91-1.913.583z" class="left_vlogo vlogo" stroke="" stroke-width="" fill=""></path>
        <path d="M8.856 6.247l-.584-1.91 1.912-.584.585 1.91-1.913.584z" class="left_vlogo vlogo" stroke="" stroke-width="" fill=""></path>
        <path d="M5.403 5.213l.584 1.91L7.9 6.54l-.585-1.911-1.912.584z" class="left_vlogo vlogo" stroke="" stroke-width="" fill=""></path>
        <path d="M2.534 6.09L3.118 8l1.913-.584-.585-1.91-1.912.583z" class="left_vlogo vlogo" stroke-width="" stroke="" fill=""></path>
        <path d="M5 9H3v7a2 2 0 002 2h10a2 2 0 002-2V9h-2v7H5V9z" fill="" class="d_vlogo vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M5 9h-2v2h2V9z" class="ll_vlogo ll_1_logo_v5 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M8 9h-2v2h2V9z" class="ll_vlogo ll_1_logo_v4 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M11 9h-2v2h2V9z" class="ll_vlogo ll_1_logo_v3 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M14 9h-2v2h2V9z" class="ll_vlogo ll_1_logo_v2 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M17 9h-2v2h2V9z" class="ll_vlogo ll_1_logo_v1 vlogo" stroke="" stroke-width=""></path>

        <path fill="" d="M5 9h-2v2h2V9z" class="rightlogo_v5 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M8 9h-2v2h2V9z" class="rightlogo_v4 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M11 9h-2v2h2V9z" class="rightlogo_v3 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M14 9h-2v2h2V9z" class="rightlogo_v2 vlogo" stroke="" stroke-width=""></path>
        <path fill="" d="M17 9h-2v2h2V9z" class="rightlogo_v1 vlogo" stroke="" stroke-width=""></path>
    </g></svg>`,
  clip: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="white"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.82739 7.28856L27.0598 1.71777L28.2433 7.07867L3.01097 12.6495L1.82739 7.28856ZM3.03003 28.9699V13.6999H28.96V28.9699H3.03003ZM19.98 21.3299L13.47 16.7299V25.9299L19.98 21.3299Z" fill="current"></path></svg>`,
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
  partner: /twitch\.tv/.test(window.location.href)
    ? `<svg width="20" height="20" viewBox="0 0 20 20"><path fill-rule="evenodd" d="m10 2 6 2 2 6-2 6-6 2-6-2-2-6 2-6 6-2ZM8.889 13.636l5.43-5.429-1.415-1.414-4.015 4.015-2.015-2.015-1.414 1.414 3.429 3.43Z" clip-rule="evenodd"></path></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4"><path fill="#1EFF00" d="M16 6.83512L13.735 4.93512L13.22 2.02512H10.265L8 0.120117L5.735 2.02012H2.78L2.265 4.93012L0 6.83512L1.48 9.39512L0.965 12.3051L3.745 13.3151L5.225 15.8751L8.005 14.8651L10.785 15.8751L12.265 13.3151L15.045 12.3051L14.53 9.39512L16.01 6.83512H16ZM6.495 12.4051L2.79 8.69512L4.205 7.28012L6.495 9.57512L11.29 4.78012L12.705 6.19512L6.5 12.4001L6.495 12.4051Z"></path></svg>`,
  cut: `<svg xmlns="http://www.w3.org/2000/svg" fill="${main_app_colors.light_purple}" width="22px" height="22px" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20,13 L20,11 L22,11 L22,13 L20,13 Z M20,16 L20,14 L22,14 L22,16 L20,16 Z M20,22 L20,20 L22,20 L22,22 L20,22 Z M20,19 L20,17 L22,17 L22,19 L20,19 Z M17,22 L17,20 L19,20 L19,22 L17,22 Z M14,22 L14,20 L16,20 L16,22 L14,22 Z M8,22 L8,20 L10,20 L10,22 L8,22 Z M11,22 L11,20 L13,20 L13,22 L11,22 Z M5,22 L5,20 L7,20 L7,22 L5,22 Z M5,19 L5,17 L7,17 L7,19 L5,19 Z M17,10 L17,8 L19,8 L19,10 L17,10 Z M14,10 L14,8 L16,8 L16,10 L14,10 Z M20,10 L20,8 L22,8 L22,10 L20,10 Z M6.66301234,7.49725925 C6.18703889,7.81485878 5.61514047,8 5,8 C3.34314575,8 2,6.65685425 2,5 C2,3.34314575 3.34314575,2 5,2 C6.65685425,2 8,3.34314575 8,5 C8,5.31266674 7.95216807,5.61416173 7.86342239,5.8975668 L10.3333333,7.75 L16.4,3.2 L17.6,4.8 L12,9 L17.6,13.2 L16.4,14.8 L10.3333333,10.25 L7.86342239,12.1024332 C7.95216807,12.3858383 8,12.6873333 8,13 C8,14.6568542 6.65685425,16 5,16 C3.34314575,16 2,14.6568542 2,13 C2,11.3431458 3.34314575,10 5,10 C5.61514047,10 6.18703889,10.1851412 6.66301234,10.5027407 L8.66666667,9 L6.66301234,7.49725925 Z M5,14 C5.55228475,14 6,13.5522847 6,13 C6,12.4477153 5.55228475,12 5,12 C4.44771525,12 4,12.4477153 4,13 C4,13.5522847 4.44771525,14 5,14 Z M5,6 C5.55228475,6 6,5.55228475 6,5 C6,4.44771525 5.55228475,4 5,4 C4.44771525,4 4,4.44771525 4,5 C4,5.55228475 4.44771525,6 5,6 Z"/></svg>`,
  kvd_logo: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="logo_main_svg" x="0px" y="0px" viewBox="0 0 500 500" style="enable-background:new 0 0 500 500;" xml:space="preserve">
    <style type="text/css">
        .st0{fill:url(#pillfiller);}
        .st1{fill:url(#SVGID_1_);}
        .st2{fill-rule:evenodd;clip-rule:evenodd;fill:#53FC18;}
    </style>
    <path d="M434.5,319.46H65.5c-22.34,0-40.45-18.11-40.45-40.45V70.25c0-22.34,18.11-40.45,40.45-40.45H434.5  c22.34,0,40.45,18.11,40.45,40.45v208.76C474.94,301.35,456.84,319.46,434.5,319.46z"/>
    <g>
        <linearGradient id="pillfiller" gradientTransform="rotate(90)" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#48DB15" id="pillfiller_progress"></stop><stop offset="15%" stop-color="#FFFFFF" id="pillfiller_base"></stop>
        </linearGradient>
        <g>
            <path class="st0" d="M66.07,97.11c-5.44,0-9.86-4.42-9.86-9.86V65.02c0-5.44,4.42-9.86,9.86-9.86h39.03    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H66.07z"/>
            <path d="M105.1,55.18c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H66.07c-5.43,0-9.84-4.41-9.84-9.84V65.02    c0-5.43,4.41-9.84,9.84-9.84H105.1 M105.1,55.13H66.07c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88V65.02C114.99,59.56,110.56,55.13,105.1,55.13L105.1,55.13z"/>
        </g>
        <g>
            <path class="st0" d="M66.07,294.11c-5.44,0-9.86-4.42-9.86-9.86v-22.24c0-5.44,4.42-9.86,9.86-9.86h39.03    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H66.07z"/>
            <path d="M105.1,252.17c5.43,0,9.84,4.41,9.84,9.84v22.23c0,5.43-4.41,9.84-9.84,9.84H66.07c-5.43,0-9.84-4.41-9.84-9.84v-22.23    c0-5.43,4.41-9.84,9.84-9.84H105.1 M105.1,252.13H66.07c-5.46,0-9.88,4.42-9.88,9.88v22.23c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.23C114.99,256.55,110.56,252.13,105.1,252.13L105.1,252.13z"/>
        </g>
        <g>
            <path class="st0" d="M66.07,228.44c-5.44,0-9.86-4.42-9.86-9.86v-22.23c0-5.44,4.42-9.86,9.86-9.86h39.03    c5.44,0,9.86,4.42,9.86,9.86v22.23c0,5.44-4.42,9.86-9.86,9.86H66.07z"/>
            <path d="M105.1,186.5c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H66.07c-5.43,0-9.84-4.41-9.84-9.84v-22.24    c0-5.43,4.41-9.84,9.84-9.84H105.1 M105.1,186.46H66.07c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.24C114.99,190.89,110.56,186.46,105.1,186.46L105.1,186.46z"/>
        </g>
        <g>
            <path class="st0" d="M66.07,162.78c-5.44,0-9.86-4.42-9.86-9.86v-22.24c0-5.44,4.42-9.86,9.86-9.86h39.03    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H66.07z"/>
            <path d="M105.1,120.84c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H66.07c-5.43,0-9.84-4.41-9.84-9.84v-22.24    c0-5.43,4.41-9.84,9.84-9.84H105.1 M105.1,120.8H66.07c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.24C114.99,125.22,110.56,120.8,105.1,120.8L105.1,120.8z"/>
        </g>
    </g>
    <g>
        <g>
            <path class="st0" d="M394.9,294.11c-5.44,0-9.86-4.42-9.86-9.86v-22.24c0-5.44,4.42-9.86,9.86-9.86h39.04    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H394.9z"/>
            <path d="M433.93,252.17c5.43,0,9.84,4.41,9.84,9.84v22.23c0,5.43-4.41,9.84-9.84,9.84H394.9c-5.43,0-9.84-4.41-9.84-9.84v-22.23    c0-5.43,4.41-9.84,9.84-9.84H433.93 M433.93,252.13H394.9c-5.46,0-9.88,4.42-9.88,9.88v22.23c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.23C443.82,256.55,439.39,252.13,433.93,252.13L433.93,252.13z"/>
        </g>
        <g>
            <path class="st0" d="M394.9,97.11c-5.44,0-9.86-4.42-9.86-9.86V65.02c0-5.44,4.42-9.86,9.86-9.86h39.04    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H394.9z"/>
            <path d="M433.93,55.18c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H394.9c-5.43,0-9.84-4.41-9.84-9.84V65.02    c0-5.43,4.41-9.84,9.84-9.84H433.93 M433.93,55.13H394.9c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88V65.02C443.82,59.56,439.39,55.13,433.93,55.13L433.93,55.13z"/>
        </g>
        <g>
            <path class="st0" d="M394.9,162.78c-5.44,0-9.86-4.42-9.86-9.86v-22.24c0-5.44,4.42-9.86,9.86-9.86h39.04    c5.44,0,9.86,4.42,9.86,9.86v22.24c0,5.44-4.42,9.86-9.86,9.86H394.9z"/>
            <path d="M433.93,120.84c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H394.9c-5.43,0-9.84-4.41-9.84-9.84v-22.24    c0-5.43,4.41-9.84,9.84-9.84H433.93 M433.93,120.8H394.9c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.24C443.82,125.22,439.39,120.8,433.93,120.8L433.93,120.8z"/>
        </g>
        <g>
            <path class="st0" d="M394.9,228.44c-5.44,0-9.86-4.42-9.86-9.86v-22.23c0-5.44,4.42-9.86,9.86-9.86h39.04    c5.44,0,9.86,4.42,9.86,9.86v22.23c0,5.44-4.42,9.86-9.86,9.86H394.9z"/>
            <path d="M433.93,186.5c5.43,0,9.84,4.41,9.84,9.84v22.24c0,5.43-4.41,9.84-9.84,9.84H394.9c-5.43,0-9.84-4.41-9.84-9.84v-22.24    c0-5.43,4.41-9.84,9.84-9.84H433.93 M433.93,186.46H394.9c-5.46,0-9.88,4.42-9.88,9.88v22.24c0,5.46,4.42,9.88,9.88,9.88h39.03    c5.46,0,9.88-4.42,9.88-9.88v-22.24C443.82,190.89,439.39,186.46,433.93,186.46L433.93,186.46z"/>
        </g>
    </g>
    <g>
        <g>
            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="250" y1="483.9316" x2="250" y2="188.1187">
                <stop offset="0.3687" style="stop-color:#53FC18"/>
                <stop offset="0.4578" style="stop-color:#48DB15"/>
                <stop offset="0.6529" style="stop-color:#2C870D"/>
                <stop offset="0.7654" style="stop-color:#1B5408"/>
            </linearGradient>
            <path class="st1" d="M250,483.93c-5.06,0-9.83-1.96-13.43-5.51l-103.96-94.25l-0.07-0.07c-3.61-3.61-5.59-8.4-5.59-13.5    c0-5.1,1.98-9.9,5.59-13.51c3.61-3.61,8.4-5.6,13.51-5.6h40.3V207.22c0-10.53,8.57-19.1,19.1-19.1h89.11    c10.53,0,19.1,8.57,19.1,19.1v144.26h40.3c5.1,0,9.89,1.99,13.5,5.59c3.61,3.61,5.6,8.4,5.6,13.51c0,5.1-1.99,9.9-5.59,13.51    l-0.15,0.14l-103.88,94.18C259.83,481.97,255.06,483.93,250,483.93z"/>
            <path d="M294.55,192.37c8.2,0,14.85,6.65,14.85,14.85v148.51h44.55c3.94,0,7.71,1.56,10.5,4.35c5.8,5.8,5.8,15.2,0,21    L260.5,475.33c-2.9,2.9-6.7,4.35-10.5,4.35s-7.6-1.45-10.5-4.35l-103.96-94.25c-2.78-2.78-4.35-6.56-4.35-10.5    c0-8.2,6.65-14.85,14.85-14.85h44.55V207.22c0-8.2,6.65-14.85,14.85-14.85H294.55 M294.55,183.87h-89.11    c-12.88,0-23.35,10.48-23.35,23.35v140.01h-36.05c-12.88,0-23.35,10.48-23.35,23.36c0,6.23,2.43,12.1,6.84,16.51l0.15,0.15    l0.15,0.14l103.82,94.12c4.39,4.31,10.19,6.68,16.35,6.68c6.16,0,11.96-2.37,16.35-6.68l103.82-94.12l0.15-0.14l0.15-0.15    c4.41-4.41,6.84-10.28,6.84-16.52s-2.43-12.1-6.84-16.51c-4.41-4.41-10.27-6.84-16.51-6.84h-36.05V207.22    C317.91,194.34,307.43,183.87,294.55,183.87L294.55,183.87z"/>
        </g>
    </g>
    <g>
        <polygon class="st2" points="270.54,285.33 270.54,260.31 245.51,260.31 245.51,235.29 229.46,235.29 229.46,285.33 145.42,285.33    145.42,51.15 229.46,51.15 229.46,101.2 245.51,101.2 245.51,76.17 270.54,76.17 270.54,51.15 354.58,51.15 354.58,135.19    329.56,135.19 329.56,160.22 304.53,160.22 304.53,176.27 329.56,176.27 329.56,201.29 354.58,201.29 354.58,285.33  "/>
        <path d="M350.09,55.64v75.07h-25.02v25.02h-25.02v25.02h25.02v25.02h25.02v75.07h-75.07v-25.02H250V230.8h-25.02v50.05h-75.07   V55.64h75.07v50.05H250V80.66h25.02V55.64H350.09 M359.07,46.67h-8.97h-75.07h-8.97v8.97v16.05H250h-8.97v8.97v16.05h-7.08V55.64   v-8.97h-8.97h-75.07h-8.97v8.97v225.21v8.97h8.97h75.07h8.97v-8.97v-41.08h7.08v16.05v8.97H250h16.05v16.05v8.97h8.97h75.07h8.97   v-8.97v-75.07v-8.97h-8.97h-16.05v-16.05v-8.97h-8.97h-16.05v-7.08h16.05h8.97v-8.97v-16.05h16.05h8.97v-8.97V55.64V46.67   L359.07,46.67z"/>
    </g>
    </svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="26px" height="26px" viewBox="0 0 48 48" fill="none">
    <g>
    <path d="M0 0H48V48H0V0Z" fill="white" fill-opacity="0.01"/>
    <g>
    <g>
    <rect fill="white" fill-opacity="0.01"/>
    <path d="M12 9.92704V7C12 5.34315 13.3431 4 15 4H41C42.6569 4 44 5.34315 44 7V33C44 34.6569 42.6569 36 41 36H38.0174" stroke="#000000" stroke-width="2"/>
    <rect x="4" y="10" rx="3" fill="${main_app_colors.bg_color}" stroke="#000000" stroke-width="2" stroke-linejoin="round" height="34" width="34"/>
    </g>
    <g>
    <g>
    <path id="Oval" d="M18.4396 23.1098L23.7321 17.6003C25.1838 16.1486 27.5693 16.1806 29.0604 17.6717C30.5515 19.1628 30.5835 21.5483 29.1319 23L27.2218 25.0228" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.4661 28.7469C12.9558 29.2573 11.9006 30.2762 11.9006 30.2762C10.4489 31.7279 10.4095 34.3152 11.9006 35.8063C13.3917 37.2974 15.7772 37.3294 17.2289 35.8777L22.3931 31.1894" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18.6631 28.3283C17.9705 27.6357 17.5927 26.7501 17.5321 25.8547C17.4624 24.8225 17.8143 23.7774 18.5916 23" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22.3218 25.8611C23.8129 27.3522 23.8449 29.7377 22.3932 31.1894" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </g>
    </g>
    </g>
    </svg>`,
};
var icons = {
  clip1:
    "data:image/png;base64,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",
  clip2:
    "data:image/png;base64,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",
};
