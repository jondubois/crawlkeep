import {
  a,
  gi,
  inlineStyler,
  topIndexHover,
  removeParentKeepChildrenBy,
} from "../../utils/web/manip-dom/index.js";
import {
  toggleSwitch,
  focusTextareaInput,
  toggleAlwaysOn,
  showToast,
} from "../../utils/web/action-dom/index.js";
import { btoaJSON } from "../../utils/shared/manip-data/modules/encoding-decoding.js";
import { xhInputKeyUp } from "../../utils/web/manip-keyboard/modules/input-key-up.js";
import { buildPart, buildContainer } from "../index.js";
import { initContentProcessing } from "../../init/modules/init-content-processing.js";
import { main_app_colors } from "../../color-palette.js";
import { updateContentOfSavedSearchUI } from "./build-saved-search-viewer.js";

import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();
import SearchManager from "../../classes/search-manager.js";
const search_mngr = SearchManager.getInstance();

export const toggle_params = {
  toggle_cont_width_px: 150,
  header_height_px: 35,
};

export async function buildXhighlightherUI() {
  // singleton
  const xh_main_cont_id = comp_mngr.xh.root_cont.id;
  gi(xh_main_cont_id)?.remove();
  // const latest_saved_search = search_mngr.latest_saved_search; // `search_mngr` would have been initialized in `buildCompanyViewer()` prior

  // build the xH UI's main container
  const xh_ui_config = {
    ...{
      // application_label,
      // background,
      background_color: main_app_colors.bg_black,
      // border_px,
      close_action: _xhClsBtnCloseAction,
      close_btn_px: 12,
      container_id: xh_main_cont_id,
      font_family: "'Open Sans', sans-serif",
      font_size_px: 15,
      footer_height_px: 6,
      // force_left,
      // force_top,
      // gradient_bg,
      header_height_px: toggle_params.header_height_px,
      // left,
      left_panel_width_px: 22,
      moveable_head: false,
      movable_footer: false,
      movable_left: false,
      movable_right: false,
      // open_action,
      // parent_elm,
      // ref_elm,
      resizeable: false,
      right_panel_width_px: 6,
      shadow:
        "-1px -1px 1px 0px #424242, 1px 1px 1px 0px #000000, 1px 1px 1px 0px #000000 inset, -1px -1px 1px 0px #424242 inset",
      // "-2px -1px 2px 0px #424242, 2px 1px 3px 0px #000000, 1px 1px 1px 0px #000000 inset, -1px -1px 1px 0px #424242 inset",
      // "rgb(204, 219, 232) 1px 2px 3px 1px inset, rgba(255, 255, 255, 0.5) -1px -2px 3px 2px inset"
      shift_col_px: 22,
      text: main_app_colors.text_white,
      // top,
    },
  };
  const parts_of_xh_component = buildContainer(xh_ui_config);

  // Customisation of the xH UI
  parts_of_xh_component.root_cont.addEventListener("click", topIndexHover);

  // insert the xH UI inside the Company Viewer
  inlineStyler(
    parts_of_xh_component.root_cont,
    `{
      background: ${xh_ui_config.background_color}; color: ${xh_ui_config.text};
      font-family:${xh_ui_config.font_family}; font-size: ${xh_ui_config.font_size_px}px;
      position: relative; top: auto; left: auto; width: 100%; box-sizing: border-box;
      text-align: left;
    }`,
  ); // overwrites existing styles
  a(parts_of_xh_component.middle_cont, [
    [
      "data-css",
      btoaJSON({
        height: -(
          (xh_ui_config.header_height_px || 32) +
          (xh_ui_config.footer_height_px || 32)
        ),
        width: -(
          (xh_ui_config.left_panel_width_px || 32) *
          (xh_ui_config.right_panel_width_px || 32)
        ),
      }),
    ],
  ]);
  parts_of_xh_component.foot_resizer.remove();

  // top-label
  inlineStyler(
    parts_of_xh_component.top_label,
    `{height: ${xh_ui_config.header_height_px * 0.9}px;}`,
  ); // transform:translate(0px,4px); background: ${xh_ui_config.background_color}; color: ${xh_ui_config.text}; 30px 100px 80px 50px 80px; max-content

  // count_cont
  const count_cont = buildPart(comp_mngr.xh.count_cont.name);
  parts_of_xh_component.top_label.appendChild(count_cont);
  count_cont.setAttribute("id", comp_mngr.xh.count_cont.id); // for future reference into `populateMatchCount`
  count_cont.appendChild(document.createTextNode("Count:"));
  const active_match_index = buildPart("active_match_index", "span");
  count_cont.appendChild(active_match_index);
  inlineStyler(active_match_index, `{text-align: right;}`);
  count_cont.appendChild(document.createTextNode("/"));
  const match_total = buildPart("match_total", "span");
  count_cont.appendChild(match_total);
  inlineStyler(match_total, `{text-align: left;}`);

  // textarea
  const textarea = buildPart(comp_mngr.xh.textarea.name, "textarea");
  parts_of_xh_component.menu_body.appendChild(textarea);
  textarea.setAttribute("id", comp_mngr.xh.textarea.id);
  a(textarea, [
    ["placeholder", "search terms"],
    ["class", "pad4"],
    ["role", "textbox"],
  ]);
  // let textarea_width =
  //   window.innerWidth * 0.5 < 300 ? window.innerWidth * 0.9 : 390;
  textarea.value = "";
  textarea.addEventListener("change", xhInputKeyUp);
  textarea.addEventListener("paste", (e) => {
    e.preventDefault();
    e.stopPropagation();
    let selected_text = window.getSelection().toString();
    let pasted_text = e.clipboardData.getData("text");
    textarea.value =
      selected_text?.length && selected_text?.length === textarea.value.length
        ? pasted_text
        : textarea.value + pasted_text;
    xhInputKeyUp(e);
  });
  focusTextareaInput(textarea);

  const open_saved_btn = buildPart(comp_mngr.xh.open_saved_btn.name);
  parts_of_xh_component.top_label.appendChild(open_saved_btn);
  open_saved_btn.setAttribute("id", comp_mngr.xh.open_saved_btn.id);
  a(open_saved_btn, [["title", "Open the list of saved searches"]]);
  open_saved_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${
    xh_ui_config.header_height_px * 0.9
  }px" height="${
    xh_ui_config.header_height_px * 0.9
  }px" viewBox="0 0 1024 1024" version="1.1"><path d="M582.4 384c0 14.08-11.52 25.6-25.6 25.6l-384 409.6c-14.08 0-25.6-11.52-25.6-25.6V192c0-14.08 11.52-25.6 25.6-25.6h230.4c14.08 0 25.6 11.52 25.6 25.6l153.6 192z" fill="#1b58a8"/><path d="M177.92 832h-5.12c-21.76 0-38.4-16.64-38.4-38.4V192c0-21.76 16.64-38.4 38.4-38.4h230.4c19.2 0 35.84 14.08 38.4 33.28l153.6 192v5.12c0 19.2-14.08 34.56-32 38.4L177.92 832z m-5.12-652.8c-7.68 0-12.8 5.12-12.8 12.8v601.6c0 5.12 3.84 10.24 7.68 11.52L550.4 396.8h5.12c5.12 0 10.24-3.84 12.8-8.96l-153.6-190.72V192c0-7.68-5.12-12.8-12.8-12.8H172.8z" fill="#01224d"/><path d="M864 793.6c0 14.08-11.52 25.6-25.6 25.6h-665.6c-14.08 0-25.6-11.52-25.6-25.6l64-512c0-14.08 11.52-25.6 25.6-25.6h678.4c14.08 0 25.6 11.52 25.6 25.6l-76.8 512z" fill="#2683fc"/><path d="M838.4 832h-665.6c-21.76 0-38.4-16.64-38.4-38.4v-1.28l64-510.72c0-20.48 17.92-37.12 38.4-37.12h678.4c21.76 0 38.4 16.64 38.4 38.4v1.28l-76.8 510.72c-1.28 20.48-17.92 37.12-38.4 37.12z m-678.4-37.12c0 6.4 6.4 11.52 12.8 11.52h665.6c7.68 0 12.8-5.12 12.8-12.8v-1.28l76.8-510.72c0-6.4-6.4-11.52-12.8-11.52h-678.4c-7.68 0-12.8 5.12-12.8 12.8v1.28l-64 510.72z" fill="#01224d"/></svg>`;
  open_saved_btn.onclick = async () => {
    await updateContentOfSavedSearchUI(search_mngr.saved_searches);
  };

  const saved_search_name_input = buildPart(
    comp_mngr.xh.saved_search_name_input.name,
    "input",
  );
  parts_of_xh_component.top_label.appendChild(saved_search_name_input);
  saved_search_name_input.setAttribute(
    "id",
    comp_mngr.xh.saved_search_name_input.id,
  );
  a(saved_search_name_input, [
    // ["class", "xh-text-elm"],
    ["placeholder", "Name your search"],
  ]);
  inlineStyler(
    saved_search_name_input,
    `{height:${xh_ui_config.header_height_px * 0.9}px;}`,
  );

  //*************toogle*********************/
  const xh_toggle_cont = buildPart(comp_mngr.xh.toggle_cont.name);
  parts_of_xh_component.top_label.appendChild(xh_toggle_cont);
  xh_toggle_cont.setAttribute("id", comp_mngr.xh.toggle_cont.id);
  inlineStyler(
    xh_toggle_cont,
    `{
      height: ${xh_ui_config.header_height_px * 0.9}px;
      width: ${toggle_params.toggle_cont_width_px}px;
    }`,
  );

  const xh_toggle_indicator = buildPart(comp_mngr.xh.toggle_indicator.name);
  xh_toggle_cont.appendChild(xh_toggle_indicator);
  xh_toggle_indicator.setAttribute("id", comp_mngr.xh.toggle_indicator.id);
  a(xh_toggle_indicator, [
    [ComponentManager.TOGGLE_STATE, "regex"],
    ["role", "status"],
  ]);
  inlineStyler(
    xh_toggle_indicator,
    `{
      height: ${xh_ui_config.header_height_px * 0.7}px;
      width: ${xh_ui_config.header_height_px * 0.7}px; 
    }`,
  );
  xh_toggle_cont.addEventListener("click", (e) => {
    toggleSwitch();
    if (_isValidSearchObject(e.currentTarget)) initContentProcessing();
  });

  const toggle_text_type = buildPart("toggle_text_type");
  xh_toggle_cont.appendChild(toggle_text_type);
  toggleSwitch();
  toggleSwitch(); // successive calls that cancel out to set the initial state
  //****************************************/

  const save_btn = buildPart("save_btn");
  parts_of_xh_component.top_label.appendChild(save_btn);
  save_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="${
    xh_ui_config.header_height_px * 0.9
  }px" width="${
    xh_ui_config.header_height_px * 0.9
  }px" fill="#000000"><path d="M3.29,6.29l4-4A1,1,0,0,1,8,2H19a2,2,0,0,1,2,2V20a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V7A1,1,0,0,1,3.29,6.29Z" style="fill: #26fc78;"/><path d="M8,14h8a1,1,0,0,1,1,1v7H7V15A1,1,0,0,1,8,14Zm6-6h2a1,1,0,0,0,0-2H14a1,1,0,0,0,0,2Z" style="fill: #000000;"/></svg>`;
  save_btn.addEventListener("click", async (e) => {
    try {
      if (!_isValidSearchObject(e.target))
        return; /* `e.target` or `save_btn` because event listener is detached before the async operation completes,
                so `.currentTarget` returns `null` */

      const saved_searches = await chrome.runtime.sendMessage({
        cmd: "saveSearch",
        prefix: ComponentManager.XH_PREFIX,
        [SearchManager.NAME_KEY]: saved_search_name_input.value.trim(),
        [SearchManager.SEARCH_EXPRESSION_KEY]: textarea.value.trim(),
        [SearchManager.TYPE_KEY]: xh_toggle_indicator.getAttribute(
          ComponentManager.TOGGLE_STATE,
        ),
      }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
      // changes to the search criteria should be reflected in the FE: reset `search_mngr`
      search_mngr.setSavedSearches(saved_searches);

      // update the content of the:
      // - xH UI
      gi(comp_mngr.xh.textarea.id).value = "";
      gi(comp_mngr.xh.saved_search_name_input.id).value = "";
      // - Saved Searches UI (until this saved search becomes a search criterium, there's no need to update the curation UI)
      await updateContentOfSavedSearchUI(search_mngr.saved_searches);
    } catch (error) {
      console.error("Error saving search:", error);
    }
  });

  const always_on_cont = buildPart("always_on_cont");
  parts_of_xh_component.top_label.appendChild(always_on_cont);
  a(always_on_cont, [
    ["title", "Extension remains active on current tab when checked"],
  ]);
  inlineStyler(
    always_on_cont,
    `{display:grid; grid-template-columns:1fr auto; justify-items: end; gap:6px;}`,
  );

  const always_on_label = buildPart("always_on_label");
  always_on_cont.appendChild(always_on_label);
  always_on_label.classList.add("display-text");
  always_on_label.innerText = `Keep extension active`; // Keep extension active on every tab

  const always_open = buildPart(comp_mngr.xh.always_open.name);
  always_on_cont.appendChild(always_open);
  always_open.setAttribute("id", comp_mngr.xh.always_open.id);
  const xh_always_on_state = await chrome.runtime.sendMessage({
    cmd: "getKeepActiveState",
    key: ComponentManager.XH_PREFIX,
  });
  inlineStyler(
    always_open,
    `{
      width: ${xh_ui_config.header_height_px * 0.6}px;
      height: ${xh_ui_config.header_height_px * 0.6}px;
    }`,
  );
  if (xh_always_on_state === "on") {
    // latest_saved_search?.state
    always_open.setAttribute("data-always-open", "on");
  } else {
    always_open.setAttribute("data-always-open", "off");
    inlineStyler(
      always_open,
      `{background:transparent; border:1px solid #26fc78;}`,
    );
  }
  always_open.onclick = (e) => toggleAlwaysOn(e);

  parts_of_xh_component.cls_btn.classList.add(
    comp_mngr.xh.cls_btn.getClassName(),
  );
  inlineStyler(
    parts_of_xh_component.cls_btn,
    `{cursor: pointer; width: ${xh_ui_config.shift_col_px || 32}px; height: ${
      xh_ui_config.shift_col_px || 32
    }px; background: ${xh_ui_config.background_color};}`,
  );
  parts_of_xh_component.cls_btn.innerHTML = `<svg x="0px" y="0px" viewBox="0 0 100 100"><g stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(2, 2)" stroke="#eb4034" stroke-width="8"><path d="M47.806834,19.6743435 L47.806834,77.2743435" transform="translate(49, 50) rotate(225) translate(-49, -50) "/><path d="M76.6237986,48.48 L19.0237986,48.48" transform="translate(49, 50) rotate(225) translate(-49, -50) "/></g></g></svg>`;
  gi(comp_mngr.companyviewer.root_cont.id).appendChild(
    parts_of_xh_component.root_cont,
  );
  return {
    ...parts_of_xh_component,
    always_on_cont,
    always_on_label,
    always_open,
    open_saved_btn,
    save_btn,
    saved_search_name_input,
    textarea,
    toggle_text_type,
    xh_toggle_cont,
    xh_toggle_indicator,
  };
}

function _xhClsBtnCloseAction() {
  // clear highlights and close the xH UI
  removeParentKeepChildrenBy(ComponentManager.HIGHLIGHTED_CLASS);
  gi(comp_mngr.xh.root_cont.id).remove();
}

/**
 * @description Verifies if the search object is valid.
 * @param {HTMLElement} target_elm - The web element to display the toast message.
 * @returns {boolean} Returns true if the search object is valid, otherwise false.
 */
function _isValidSearchObject(target_elm) {
  const is_valid_search_name = gi(
    comp_mngr.xh.saved_search_name_input.id,
  ).value.trim();
  // const is_valid_search_expression = gi(comp_mngr.xh.textarea.id).value.trim();

  if (!is_valid_search_name) {
    let message = "Please enter a valid search name";
    showToast(target_elm, message, gi(comp_mngr.xh.root_cont.id));
    return false;
  }

  // if (!(is_valid_search_name && is_valid_search_expression)) {
  //   let message = "";
  //   if (!is_valid_search_name && !is_valid_search_expression) {
  //     message = "Please enter a valid search name and search expression";
  //   } else if (!is_valid_search_name) {
  //     message = "Please enter a valid search name";
  //   } else {
  //     message = "Please enter a valid search expression";
  //   }
  //   showToast(target_elm, message, gi(comp_mngr.xh.root_cont.id));
  //   return false;
  // }
  return true;
}
