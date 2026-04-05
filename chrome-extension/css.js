import { main_app_colors } from "./color-palette.js";
import { setCSS } from "./utils/web/manip-dom/modules/set-css.js";

import { ComponentManager } from "./classes/component-manager.js";
import SearchManager from "./classes/search-manager.js";
const comp_mngr = ComponentManager.getInstance();
const CONTENT_FONT_FAMILY = "Arial, sans-serif";
const CONTENT_FONT_SIZE_PX = 20;
const UI_FONT_FAMILY = "'Open Sans', sans-serif";
const UI_FONT_SIZE_PX = 20;
const STANDARD_MARGIN_PX = 5;

const template_config = {
  border_radius_px: 10,
  body_inner_radius_em: 0.2,
  body_padding_bottom_px: 0,
};

const file_uploader_config = {
  body_inner_radius_em: 0.2,
};

function getMainAppCss() {
  return `
    .${ComponentManager.HIGHLIGHTED_CLASS}{
        border-radius: 0.2em;
        padding: 0.6px;
    }

    .${comp_mngr.template.head_mover.name} {
        cursor: move; user-select: none;
    }

    .${ComponentManager.COMPANY_VIEWER_PREFIX} {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: 5px;
        height: 100vh;
    }
    
    #${comp_mngr.companyviewer.content_viewer.id} {
        grid-row: 1;
        display: grid;
        grid-template-rows: 1fr auto;
        grid-template-columns: 1fr 3fr;
        gap: 5px;
        overflow: hidden;
        box-sizing: border-box;
        margin: 0px auto;
        padding: 5px;
        background-color: ${main_app_colors.bg_black} !important;
        color: ${main_app_colors.text_white} !important;
        height: 100%;
        width: 100%;
    }

    #${comp_mngr.xh.root_cont.id} {
        grid-row: 2;
        flex-shrink: 0; /* Prevents shrinking */
    }

    div.section.${comp_mngr.companyviewer.company_info.getClassName()} {
      display: flex;
      flex-direction: column;
      overflow-y: auto; /* vertical scroll bar */
      flex: 1; /* allow the container to grow and fill available space */
      grid-column-start: 1;
      grid-column-end: undefined;
      grid-row-start: 1;
      grid-row-end: 2;
    }

    div.section.${comp_mngr.companyviewer.employee_urls.getClassName()} {
      display: flex;
      flex-direction: column;
      height: auto;
      overflow-y: auto;
      flex: 1;
      grid-column-start: 1;
      grid-column-end: 2;
      grid-row-start: 2;
      grid-row-end: 3;
      /* grid-column-start: 2;
      grid-column-end: 3;
      grid-row-start: 2;
      grid-row-end: 3; */
    }

    div.section ul  {
        column-fill: auto;
        padding-left: 10px;
        flex: 1;
        max-height: 15vh;
        column-count: 1; /* ensure each li is listed on its own line */
        -webkit-column-count: 1; /* For Safari and older versions of Chrome */
        -moz-column-count: 1; /* For older versions of Firefox */
    }
    
    div.section.${comp_mngr.companyviewer.employee_urls.getClassName()} > ul {
      flex: 1;
      max-height: 15vh;
      columns: 3 auto;
      -webkit-columns: 3 auto; /* For Safari and older versions of Chrome */
      -moz-columns: 3 auto; /* For older versions of Firefox */
    }

    div.section.${comp_mngr.companyviewer.employee_urls.getClassName()} > .buttons-container {
      display: flex;
      justify-content: space-between; /* distributes buttons evenly along the X axis */
      margin-top: ${STANDARD_MARGIN_PX}px;
    }
    
    div.section.${comp_mngr.companyviewer.matching_search_criteria.getClassName()} {
      display: flex;
      flex-direction: column;
      height: auto;
      overflow-y: auto;
      flex: 1;
      grid-column-start: 2;
      grid-column-end: undefined;
      grid-row-start: 2;
      grid-row-end: 3;
      /* grid-column-start: 3;
      grid-column-end: undefined;
      grid-row-start: 2;
      grid-row-end: 3; */
    }
    
    div.section.${comp_mngr.companyviewer.matching_search_criteria.getClassName()} > ul {
      columns: 4 auto;
    }
    
    div.section.${comp_mngr.companyviewer.matching_search_criteria.getClassName()} > .buttons-container {
      display: flex;
      justify-content: space-between;
    }

    li.${comp_mngr.companyviewer.matching_search_criteria.getClassName()} {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-items: start;
        gap: 5px;
    }
    
    #${comp_mngr.xh.always_open.id} {
        cursor:pointer;
        background:#26fc78; border:1px solid transparent;
        border-radius:1em; border:1px solid #26fc78;
        transition: 0.2s cubic-bezier(0.85, 0.05, 0.18, 1.35);
    }

    .${comp_mngr.xh.cls_btn.getClassName()} {
        border-radius: 2em;
        box-shadow:
        -2px -1px 2px 0px #424242,
        2px 1px 3px 0px #000000;
    }
    .${comp_mngr.xh.cls_btn.getClassName()}:active {
        box-shadow:
        -2px -1px 2px 0px #424242,
        2px 1px 3px 0px #000000,
        1px 1px 1px 0px #000000 inset,
        -1px -1px 1px 0px #424242 inset;   
    }

    #${comp_mngr.xh.root_cont.id} .top-label {
      display: grid; grid-template-columns: 100px auto 1fr auto 1fr auto; gap: 10px;
      align-items: center;
    }

    #${comp_mngr.xh.count_cont.id} {
        grid-column: 1;
        display:grid; grid-template-columns:auto 1fr auto 1fr auto; gap:5px;
    }

    #${comp_mngr.xh.open_saved_btn.id} {
        grid-column: 2;
        cursor:pointer;
    }
        
    #${comp_mngr.xh.saved_search_name_input.id}{
        grid-column: 3;
        all: unset !important;
        min-height:16px;
        padding:2px;
        background: ${main_app_colors.bg_rgba_26} !important;
        color: ${main_app_colors.text_white} !important;
        box-shadow:
        -2px -1px 2px 0px #42424260,
        2px 1px 3px 0px #00000060,
        1px 1px 1px 0px #00000060 inset,
        -1px -1px 1px 0px #42424260 inset !important;
        border-color:transparent !important;
        border-radius:0.4em !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
    }
    #${comp_mngr.xh.saved_search_name_input.id}::placeholder{
        color:${main_app_colors.placeholder};
        opacity: 1;
    }
    #${comp_mngr.xh.saved_search_name_input.id}::-ms-input-placeholder{
        color:${main_app_colors.placeholder};
        opacity: 1;
    }

    #${comp_mngr.xh.toggle_cont.id} {
        grid-column: 4;
        display: flex;
        align-items: center;
        justify-content: center;    
        overflow: hidden;
        cursor: pointer;
        border: 0px;
        border-radius: 2em;
        box-shadow:
        -2px -1px 2px 0px #424242,
        2px 1px 3px 0px #000000,
        1px 1px 1px 0px #000000 inset,
        -1px -1px 1px 0px #424242 inset;
    }

    #${comp_mngr.xh.toggle_indicator.id} {
        margin: 0px;
        padding: 0px;
        outline: 0;
        border: 0; border-radius: 2em;
        box-shadow: -1px -1px -1px 0px #f5f8fa, 2px 1px 1px 0px #000000;
        transition: transform 0.2s cubic-bezier(0.85, 0.05, 0.18, 1.35);
    }

    .save-btn {
        grid-column: 5;
        cursor:pointer;
    }

    button {
        background-color: ${main_app_colors.bg_light_grey} !important;
        color: ${main_app_colors.bg_black} !important;
        width: max-content;
        flex: 0 0 auto; /* flex-grow, flex-shrink, flex-basis: button's size, fits its content */
        overflow: hidden;
        display: inline-block;
        font-size: ${UI_FONT_SIZE_PX}px;
        text-align: center;
        text-decoration: none;
        margin: ${STANDARD_MARGIN_PX}px auto;
        padding: 6px 12px;
        cursor: pointer;
        border: 1px solid ${main_app_colors.body_border};
        border-radius: 2px;
    }

    button:hover {
        background-color: ${main_app_colors.bg_shadow} !important;
    }

    .always-on-cont {
        grid-column: 6;
    }

    .file-uploader {
        margin: 0px;
        display: block;
        padding: 10px;
        border: 1px solid ${main_app_colors.body_border}; 
        border-radius: ${file_uploader_config.body_inner_radius_em}em;
        background-color:${main_app_colors.body_bg} !important;
    }

    .display-text {
        font-family: ${CONTENT_FONT_FAMILY};
        font-size: ${CONTENT_FONT_SIZE_PX}px;
        text-align: left;
    }

    .parent_highlight{
        background:#1c1c1c; color:#ffffff; border-radius: 0.2em; box-shadow: 1px 1px 1px rgba(26,26,26,0.6); padding: 0.6px;
    }

    .section {
      margin: 0px; padding: 0px;
      border: 1px solid #ccc;
    }
    
    .section-label {
      margin-bottom: ${STANDARD_MARGIN_PX}px;
      display: block;
      font-weight: bold;
      color: violet;
      cursor: default;
    }

/* taxonomy criteria selection checkbox */
#${comp_mngr.savedsearchviewer.saved_search_table.id} {
  display: table;
  width: 100%;
  border-collapse: collapse;
  background: ${main_app_colors.bg_rgba_26};
  color: ${main_app_colors.text_white};
  border-radius: 0.4em;
  padding: 5px;
}

#${comp_mngr.savedsearchviewer.saved_search_table.id} th {
  background: ${main_app_colors.bg_rgba_02};
  color: ${main_app_colors.text_white};
  font-weight: bold;
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid ${main_app_colors.text_white};
}

#${comp_mngr.savedsearchviewer.saved_search_table.id} td {
  padding: 10px;
  border-bottom: 1px solid #ffffff;
}

.${comp_mngr.getClassName(SearchManager.SEARCH_EXPRESSION_KEY)} {
  max-width: 50ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#${
    comp_mngr.savedsearchviewer.saved_search_table.id
  } .${comp_mngr.savedsearchviewer.delete_search_input.getClassName()} {
  cursor: pointer;
}


    .pointer {
        cursor: pointer;
    }

    .justified {
        justify-self: center !important;
    }

    input[type="image"] {
        height: ${CONTENT_FONT_SIZE_PX * 1.8}px;
        width: ${CONTENT_FONT_SIZE_PX * 1.8}px;
        cursor: pointer; /* Hand pointing cursor for clickable images */
    }

    input[type=checkbox] {
        background-color: initial;
        cursor: default;
        appearance: auto;
        box-sizing: border-box;
        margin: 3px 3px 3px 4px;
        padding: initial;
        border: initial;
        width: ${UI_FONT_SIZE_PX * 1}px;
        height: ${UI_FONT_SIZE_PX * 1}px;
    }
    
    input[type="text"], textarea {
        cursor: text; /* I-beam cursor. Applies to both input elements of type text and textarea elements */
    }

    #${comp_mngr.savedsearchviewer.saved_search_table.id} tbody label {
      display: none;
      cursor: default;
    }

    .select-all-wrapper input[type="checkbox"] {
        order: 2;
    }

    .select-all-wrapper label {
        order: 1;
    }

    .center-text {
      text-align: center;
    }

    .centered-flex {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .flex-dir-column {
        flex-direction: column;
    }

    th {
        display: table-cell;
        vertical-align: inherit;
        unicode-bidi: isolate;
    }

    td {
        display: table-cell;
        vertical-align: inherit;
        unicode-bidi: isolate;
    }

    ul {
        display: block !important;
        margin-block-start: ${STANDARD_MARGIN_PX}px !important;
        margin-block-end: ${STANDARD_MARGIN_PX}px !important;
        margin-inline-start: ${STANDARD_MARGIN_PX}px !important;
        margin-inline-end: ${STANDARD_MARGIN_PX}px !important;
        padding-inline-start: 0px;
        unicode-bidi: isolate;  /* Controls the bidirectional text algorithm.
                                The isolate value ensures that the element's text directionality is isolated from its surroundings,
                                preventing it from affecting or being affected by the surrounding text.  */
    }
    
    li {
        break-inside: avoid;
        display: list-item;
        width: 100%;
        list-style: disc outside none !important;
        padding-inline-start: ${STANDARD_MARGIN_PX}px ;
    }
    
    li::marker {
      unicode-bidi: isolate;
      font-variant-numeric: tabular-nums;
      text-transform: none;
      text-indent: 0px !important;
      text-align: start !important;
      text-align-last: start !important;
    }

    dl {
      margin: 0px;
      padding: 0px;
    }

    dt, dd {
      display: inline;
    }

    dd p {
      line-height: 1.5;
      margin-block: ${STANDARD_MARGIN_PX}px 0;
      display: inline-block; 
    }

    dt {
      font-weight: bold;
    }

    dt::after {
      content: ": ";
    }

    dd {
      margin-left: ${STANDARD_MARGIN_PX}px;
    }
    
    .anchor {
      text-align: left; color: blue; text-decoration: underline;
    }

    .checkbox-list-header {
        margin-bottom: ${STANDARD_MARGIN_PX}px;
    }

    .prop-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-items: start;
        margin: ${STANDARD_MARGIN_PX}px;
    }

    .checkbox-wrapper {
        display: flex;
        align-items: center;
        justify-items: start;
        margin: ${STANDARD_MARGIN_PX}px;
    }

    .checkbox-label {
        color: inherit;   /*  by default, some properties like color might not be inherited by child elements, especially form elements like label */
    }

    /* define different hues and text colors */
    .hue-0-39 {
        background: hsl(0, 100%, 50%);
        color: #FFFFFF;
        border-top: 1px solid hsl(0, 100%, 60%);
        border-bottom: 1px solid hsl(0, 100%, 30%);
        border-right: 1px solid hsl(0, 100%, 45%);
        border-left: 1px solid hsl(0, 100%, 55%);
    }

    .hue-40-99 {
        background: hsl(40, 100%, 50%);
        color: #000000;
        border-top: 1px solid hsl(40, 100%, 60%);
        border-bottom: 1px solid hsl(40, 100%, 30%);
        border-right: 1px solid hsl(40, 100%, 45%);
        border-left: 1px solid hsl(40, 100%, 55%);
    }

    .hue-100-168 {
        background: hsl(100, 100%, 50%);
        color: #FFFFFF;
        border-top: 1px solid hsl(100, 100%, 60%);
        border-bottom: 1px solid hsl(100, 100%, 30%);
        border-right: 1px solid hsl(100, 100%, 45%);
        border-left: 1px solid hsl(100, 100%, 55%);
    }

    .hue-169-189 {
        background: hsl(169, 100%, 50%);
        color: #000000;
        border-top: 1px solid hsl(169, 100%, 60%);
        border-bottom: 1px solid hsl(169, 100%, 30%);
        border-right: 1px solid hsl(169, 100%, 45%);
        border-left: 1px solid hsl(169, 100%, 55%);
    }

    .hue-190-240 {
        background: hsl(190, 100%, 50%);
        color: #FFFF99;
        border-top: 1px solid hsl(190, 100%, 60%);
        border-bottom: 1px solid hsl(190, 100%, 30%);
        border-right: 1px solid hsl(190, 100%, 45%);
        border-left: 1px solid hsl(190, 100%, 55%);
    }

    .hue-241-300 {
        background: hsl(241, 100%, 50%);
        color: #99FF99;
        border-top: 1px solid hsl(241, 100%, 60%);
        border-bottom: 1px solid hsl(241, 100%, 30%);
        border-right: 1px solid hsl(241, 100%, 45%);
        border-left: 1px solid hsl(241, 100%, 55%);
    }

    .hue-301-360 {
        background: hsl(301, 100%, 50%);
        color: #FFFFFF;
        border-top: 1px solid hsl(301, 100%, 60%);
        border-bottom: 1px solid hsl(301, 100%, 30%);
        border-right: 1px solid hsl(301, 100%, 45%);
        border-left: 1px solid hsl(301, 100%, 55%);
    }

    .${ComponentManager.HIGHLIGHTED_CLASS}.active {
      background: hsl(30, 100%, 50%) !important;
      color: #FFFFFF !important;
      box-shadow: 2px -0px 5px rgba(26, 26, 26, 0.6), 4px 4px 5px rgba(26, 26, 26, 0.6);
      animation: glow 766ms infinite alternate;
    }
    
    /* Keyframes for glow effect */
    @keyframes glow {
      0% {
        filter: brightness(0.98);
        box-shadow: 2px -0px 4px rgba(26, 26, 26, 0.6), 2px 3px 4px rgba(26, 26, 26, 0.6);
      }
      100% {
        filter: brightness(1.68);
        box-shadow: 2px -0px 5px rgba(26, 26, 26, 0.6), 4px 4px 5px rgba(26, 26, 26, 0.6);
      }
    }

    .${comp_mngr.xh.textarea.getClassName()} {
        min-height:40px; width: 100%;
        box-sizing: border-box;
        autocomplete: off;
        border: 0px;
        border-color:transparent;
        border-radius:0.4em;
        background: ${main_app_colors.bg_rgba_26};
        color: ${main_app_colors.text_white};
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        border: 0px;
        box-shadow:
        -2px -1px 2px 0px #424242,
        2px 1px 3px 0px #000000,
        1px 1px 1px 0px #000000 inset,
        -1px -1px 1px 0px #424242 inset;
    }
    .${comp_mngr.xh.textarea.getClassName()}:focus {
        background: transparent !important;
        box-shadow: rgb(204, 219, 232) 3px 5px 4px 1px inset, rgba(255, 255, 255, 0.5) -2px -2px 4px 2px inset;
    }
    .${comp_mngr.xh.textarea.getClassName()}:active {
        background: transparent !important;
        box-shadow: rgb(204, 219, 232) 3px 4px 4px 1px inset, rgba(255, 255, 255, 0.5) -2px -2px 4px 2px inset;
    }
    .${comp_mngr.xh.textarea.getClassName()}:hover {
        box-shadow: rgb(204, 219, 232) 2px 3px 4px 1px inset, rgba(255, 255, 255, 0.5) -2px -2px 4px 2px inset;
    }
    .${comp_mngr.xh.textarea.getClassName()}::placeholder {
        color: ${main_app_colors.placeholder};
        opacity: 1;
    }
    .${comp_mngr.xh.textarea.getClassName()}::-ms-input-placeholder {
        color: ${main_app_colors.placeholder};
        opacity: 1;
    }

    /** toast **/
    .toast {
        visibility: hidden;
        min-width: 250px;
        margin-left: -125px;
        background-color: #333;
        color: #fff;
        text-align: center;
        border-radius: 2px;
        padding: 16px;
        position: fixed;
        z-index: 1;
        left: 50%;
        bottom: 30px;
      font-size: ${UI_FONT_SIZE_PX}px;
    }

    .toast.show {
        visibility: visible;
        -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
        animation: fadein 0.5s, fadeout 0.5s 2.5s;
    }

    @-webkit-keyframes fadein {
        from {bottom: 0; opacity: 0;} 
        to {bottom: 30px; opacity: 1;}
    }

    @keyframes fadein {
        from {bottom: 0; opacity: 0;}
        to {bottom: 30px; opacity: 1;}
    }

    @-webkit-keyframes fadeout {
        from {bottom: 30px; opacity: 1;} 
        to {bottom: 0; opacity: 0;}
    }

    @keyframes fadeout {
        from {bottom: 30px; opacity: 1;}
        to {bottom: 0; opacity: 0;}
    }
    /**********/

    /***** loading spinner *****/
    .loading-spinner {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        visibility: hidden;
        opacity: 0;
        flex-direction: column;
        align-items: center;
        transition: visibility 0s, opacity 0.15s ease-out;
        will-change: opacity;
        contain: layout; /* Add containment */
        pointer-events: none; /* Prevent capturing mouse events */
    }
    
    .loading-spinner.show {
        visibility: visible;
        opacity: 1;
    }
    
    .spinner-icon {
        width: 30px;
        height: 30px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-top-color: #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        will-change: transform; /* Optimize for animation */
        contain: strict; /* Strongest containment */
    }
    /**********/
    
    .disabled {
      pointer-events: none;
      opacity: 0.5;
      transition: opacity 0.3s ease; /* transition for a smoother effect */
    }
        
    .pad2 {
        padding: 2px;
    }
    .pad4 {
        padding: 4px;
    }
    .pad6 {
        padding: 6px;
    }
    .pad8 {
        padding: 8px;
    }
    .centertext {
        text-align: center;
    }
    .h32 {
        height: 32px;
    }
    .move_bg {
        cursor: move;
        user-select: none;
    }
    .gen_btn{
        box-shadow:
        -0px -1px 1px 0px #424242,
        1px 1px 3px 0px #000000;
    }
    .gen_btn:hover{
        box-shadow:
        -0px -1px 2px 0px #424242,
        0px 1px 3px 0px #000000;
    }
    .gen_btn:active{
        box-shadow:
        -0px -1px 2px 0px #424242,
        2px 1px 3px 0px #000000,
        1px 1px 1px 0px #000000 inset,
        -1px -1px 1px 0px #424242 inset;   
    }

      .res-option {
          text-align:center;
          color:${main_app_colors.body_bg};
          padding: 0px;
          background:${main_app_colors.bg_color}50;
          margin:auto;
          border-radius:0.2em;
          cursor: pointer;
          transition: all 111ms;
      }
      .res-option:hover {
          color:${main_app_colors.bg_color};
          background:${main_app_colors.body_bg};
      }
      .res-option:active {
          color:${main_app_colors.bg_color};
          background:${main_app_colors.body_bg};
          box-shadow:-0px -0px 1px 0px ${main_app_colors.bg_color}80,
          2px 1px 2px 0px ${main_app_colors.bg_color},
          2px 1px 1px 0px ${main_app_colors.bg_shadow} inset,
          -2px -1px 1px 0px ${main_app_colors.bg_highlight}50 inset;
      }
      .res-option.checked {
          color:${main_app_colors.bg_color};
          background:${main_app_colors.body_bg};
          box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 3px 1px;
      }
      .hover-btn {
          box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
          cursor: pointer;
          border-radius: 50%;
          transition: all 111ms;
          user-select: none;
      }
      .hover-btn:hover {
          box-shadow: rgba(136, 165, 191, 0.48) 4px 2px 4px 0px, rgba(255, 255, 255, 0.8) -4px -2px 4px -3px;
      }
      .hover-btn:active {
          box-shadow:
          -1px -1px 1px 0px #ffffff,
          1px 1px 1px 0px rgb(204, 219, 232),
          4px 4px 4px 0px rgb(204, 219, 232) inset,
          -2px -2px 4px 0px #ffffff inset;
      }

      .load-box{
          border-radius:2em;
          padding:2px;
          color:transparent;
          background:transparent;
      }
      .preview-img {
          border-radius:0.4em;
          transform:translate(0px,-0px);
          animation: preview-img 33s infinite;
          animation-timing-function: cubic-bezier(0,1.19,.2,1);
      }
      @keyframes preview-img {
          0% {
              transform:translate(0px,-33.8px);
          }
          6% {
              transform:translate(0px,-67.6px);
          }
          12% {
              transform:translate(0px,-101.4px);
          }
          18% {
              transform:translate(0px,-135.2px);
          }
          24% {
              transform:translate(0px,-169px);
          }
          30% {
              transform:translate(0px,-202.8px);
          }
          36% {
              transform:translate(0px,-236.6px);
          }
          42% {
              transform:translate(0px,-270.4px);
          }
          48% {
              transform:translate(0px,-304.2px);
          }
          54% {
              transform:translate(0px,-270.4px);
          }
          60% {
              transform:translate(0px,-236.6px);
          }
          66% {
              transform:translate(0px,-202.8px);
          }
          72% {
              transform:translate(0px,-169px);
          }
          78% {
              transform:translate(0px,-135.2px);
          }
          84% {
              transform:translate(0px,-101.4px);
          }
          90% {
              transform:translate(0px,-67.6px);
          }
          96% {
              transform:translate(0px,-33.8px);
          }
          100% {
              transform:translate(0px,-0px);
          }
      }
  
      @keyframes loader-animation {
          from {
            transform:translateX(-16px) scale(1.5,1.5);
            background-color: ${main_app_colors.bg_color} !important;
            color: ${main_app_colors.text_white} !important;
            box-shadow: ${main_app_colors.bg_color}40 2px 1px 2px 0px, ${
              main_app_colors.bg_color
            }80 -1px -2px 1px -1px;
          }
          to {
            transform:translateX(0px) scale(0.9,0.9);
            background-color: ${main_app_colors.light_purple} !important;
            color: ${main_app_colors.bg_color} !important;
            box-shadow:
                -0px -0px 1px 0px ${main_app_colors.bg_color}80,
                1px 0px 1px 0px ${main_app_colors.bg_color},
                2px 0px 1px 0px ${main_app_colors.light_purple} inset,
                -2px -1px 1px 0px ${main_app_colors.bg_color}80 inset;
          }
        }
  
        .resize-svg:hover{
          transition:all 222ms;
          transform:translate(-2px,-2px) scale(1.2,1.2);
        }
  
  
  
        .vid_control_bar{
          padding:0px;
          background:#000000;
          cursor:pointer;
          margin:0px;
  
        }
        .vid_control_ball.active{
            background: #f69d3c;
            box-shadow:-0px -0px 0px 0px #f5a247;
        }
        .vid_control_ball.active:hover{
            box-shadow:-0px -0px 0px 0px #f5a247;
        }
        .vid_control_ball.active:active{
            background: radial-gradient(transparent 20%, #f69d3c 80%, #f69d3c 100%);
        }
        .vid_control_ball{
          cursor:pointer;
          padding:0px;
          margin:0px;
          background:${main_app_colors.bg_color};
          border-radius:2em;
          box-shadow:-0px -0px 1px 0px ${main_app_colors.bg_color}80,
          1px 1px 2px 0px ${main_app_colors.bg_color},
          1px 1px 1px 0px ${main_app_colors.bg_highlight} inset,
          -1px -1px 1px 0px ${main_app_colors.bg_shadow} inset;
        }
        .vid_control_ball:hover{
          box-shadow:-1px -0px 1px 0px ${main_app_colors.bg_color}80,
          2px 1px 2px 0px ${main_app_colors.bg_color},
          1.5px 1px 1px 0px ${main_app_colors.bg_highlight} inset,
          -2px -1px 1px 0px ${main_app_colors.bg_shadow} inset;
        }
        .vid_control_ball:active {
          cursor:col-resize;
          background: radial-gradient(transparent 20%, #f69d3c 80%, #f69d3c 100%);
          /* background:${main_app_colors.bg_color}50; */
          /* box-shadow:-0px -0px 0px 0px ${main_app_colors.bg_color}80,
          2px 1px 2px 0px ${main_app_colors.bg_color},
          2px 1px 1px 0px ${main_app_colors.bg_shadow} inset,
          -2px -1px 1px 0px ${main_app_colors.bg_highlight}50 inset; */
      }
      .vid_time_display{
          outline: none !important;
          border-radius: 0.4em;
          border: 0px;
          background: ${main_app_colors.bg_color};
          transition:top 200ms cubic-bezier(.59,-0.54,.49,1.55), left 60ms cubic-bezier(.58,.98,.08,.52);
          box-shadow:-0px -0px 1px 0px ${main_app_colors.bg_color},
          2px 1px 2px 0px ${main_app_colors.bg_color},
          2px 1px 1px 0px ${main_app_colors.bg_shadow} inset,
          -2px -1px 1px 0px ${main_app_colors.bg_highlight}50 inset;
      }
  
      .vod_info_cont{
          visibility:hidden;
          position: absolute;
          width:86%;
          top:16px;
          left:16px;
          color:#ffffff;
          background:${main_app_colors.bg_color}60;
      }
      .vod_info_cont:hover{
          visibility:visible;
      }
      .video_controls_cont{
          height:1px;
          width:56px;
          visibility:hidden;
          position: absolute;
          display:grid;
          grid-template-rows:auto;
          row-gap: 2px;
          top:16px;
          right:16px;
      }
      .video_controls_cont:hover{
          visibility:visible;
      }
      .pop_out_video{
          width:100%;
      }
      #tvd_video_viewer:has(.pop_out_video:hover) .video_controls_cont{
          visibility:visible;
      }
      #tvd_video_viewer:has(.pop_out_video:hover) .vod_info_cont{
          visibility:visible;
      }
      .show_title_pop[title]:hover::after {
          content: attr(title);
          position: absolute;
          color:#1c1c1c;
          left: -100%;
          background:#ffffff;
          font-size:0.7em;
          padding:6px;
          border-radius:1em;
          text-align:center;
      }
      .side_vid_controls_btn{
          width:56px;
      }
  
  
  
  
  
  
      .ll_1_logo_v5{
          transform:translate(-0px,-4px);
      }
      .ll_1_logo_v4{
          transform:translate(-0px,-5.5px);
      }
      .ll_1_logo_v3{
          transform:translate(-0px,-6.5px);
      }
      .ll_1_logo_v2{
          transform:translate(-0px,-7.5px);
      }
      .ll_1_logo_v1{
          transform:translate(-0px,-8.5px);
      }
  
      .rightlogo_v5{
          transform:translate(-0px,-4.5px);
      }
      .rightlogo_v4{
          transform:translate(-0px,-3px);
      }
      .rightlogo_v3{
          transform:translate(-0px,-2px);
      }
      .rightlogo_v2{
          transform:translate(-0px,-1px);
      }
      .rightlogo_v1{
          transform:translate(-0px,-0px);
      }
      .left_vlogo{
          visibility:hidden;
          transform:translate(-0px,-2px);
      }
      #tvd_clipper_logo:hover .vlogo{
          transition:transform 200ms;
          transform:translate(-0px,0px);
      }
      #tvd_clipper_logo:hover .ll_vlogo{
          visibility:hidden;
      }
      #tvd_clipper_logo:hover .left_vlogo{
          visibility:visible;
      }
      #tvd_clipper_logo:active .left_vlogo{
          transform:rotate(17deg) translate(2.4px,-0.3px);
          visibility:visible;
      }
      .d_vlogo{
          transform:translate(-0px,1.6px);
      }
      #tvd_clipper_logo{
          transition:transform 200ms;
          transform:rotate(-90deg);
      }
      #tvd_clipper_logo:hover{
          transform:rotate(-0deg);
      }
  
      .max-height43{
          max-height:43px;
      }
  
      .title_simple_text{
          border-top-left-radius:1em;
          border-bottom-left-radius:1em;
          border-top-right-radius:0em;
          border-bottom-right-radius:0em;
          color:#ffffff;
          background:${main_app_colors.bg_highlight};
          font-size:0.7em;
          padding:6px;
          text-align:center;
          width:fit-content;
          white-space: nowrap;
          word-break: keep-all;
          // box-shadow: rgba(136, 165, 191, 0.48) 10px 2px 10px 0px, rgba(255, 255, 255, 0.8) -2px -2px 1px -1px;
      }
      .title_simple_pointer{
          border-top: 13px solid transparent;
          border-bottom: 13px solid transparent;
          border-left: 13px solid ${main_app_colors.bg_highlight};
          width:0px;
          height:0px;
      }
      .show_title_simple_elm{
          text-align:center;
          width:fit-content;
          white-space: nowrap;
          word-break: keep-all;
          background:transparent;
          display:grid;
          grid-template-columns:1fr 26px;
          gap:0px;
          visibility:hidden;
          position:absolute;
          right:42px;
      }
      .show_title_simple_ref:hover .show_title_simple_elm{
          visibility:visible;
      }
      .fitwidth{
          width:fit-width;
      }
  `;
}

/**
 * @todo - separate Styling of Company viewer and XH keyword box
 */
export function setMainCss(style_id) {
  setCSS(style_id, getMainAppCss());
}
// div.section.${comp_mngr.companyviewer.keyword_journal_ul.getClassName()} {
//   display: flex;
//   flex-direction: column;
//   height: auto;
//   overflow-y: auto;
//   flex: 1;
//   grid-column-start: 1;
//   grid-column-end: 2;
//   grid-row-start: 2;
//   grid-row-end: 3;
// }
