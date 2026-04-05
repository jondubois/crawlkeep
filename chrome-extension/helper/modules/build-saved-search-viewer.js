import { buildContainer, buildPart } from "../index.js";
import {
  inlineStyler,
  tn,
  gi,
  ge,
  setAttributes,
  createAndAppendCheckboxTo,
} from "../../utils/web/manip-dom/index.js";
import { showToast } from "../../utils/web/action-dom/modules/show-toast.js";
const icon_delete_src = chrome.runtime.getURL(
  "images/icon-delete.png",
); /* generates an absolute URL that points to the resource within the extension's directory, not the default behaviour of looking into the web page's URL */
import { initContentProcessing } from "../../init/modules/init-content-processing.js";
// import { saveCheckboxState } from "./save-checkbox-state.js";

import { ComponentManager } from "../../classes/component-manager.js";
import SearchManager from "../../classes/search-manager.js";
import { main_app_colors } from "../../color-palette.js";
const comp_mngr = ComponentManager.getInstance();
const search_mngr = SearchManager.getInstance();

const CLASS_NAME = ComponentManager.SAVED_SEARCH_VIEWER_PREFIX;
const TIMESTAMP_KEY = SearchManager.TIMESTAMP_KEY;
const SEARCH_EXP_KEY = SearchManager.SEARCH_EXPRESSION_KEY;

export async function buildSavedSearchesViewer() {
  // singleton
  gi(comp_mngr.savedsearchviewer.root_cont.id)?.remove();

  const saved_searches = search_mngr.saved_searches; // initialised at `buildCompanyViewer()`, or reset;

  if (!saved_searches?.length) {
    showToast(
      gi(comp_mngr.xh.open_saved_btn.id),
      "Save a search first",
      gi(comp_mngr.xh.root_cont.id),
    );
    return;
  }

  const saved_rect = await chrome.runtime.sendMessage({
    cmd: "getLatestRect",
    id: comp_mngr.savedsearchviewer.root_cont.id,
  });

  const saved_searches_cont_config = {
    ...{
      // application_label,
      background: main_app_colors.bg_rgba_purple,
      // background_color,
      // border_px,
      close_action: async () => {
        for (const search of search_mngr.search_criteria) {
          await chrome.runtime.sendMessage({
            cmd: "setSearchCriterium",
            prefix: ComponentManager.XH_PREFIX,
            [TIMESTAMP_KEY]: search[TIMESTAMP_KEY],
          }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
        }
        parts_of_saved_searches_cont.root_cont.remove();
      },
      close_btn_px: 10,
      container_id: comp_mngr.savedsearchviewer.root_cont.id, // "xh_saved_searches_cont",
      font_family: "'Open Sans', sans-serif",
      font_size_px: 15,
      footer_height_px: 6,
      // force_left,
      // force_top,
      // gradient_bg,
      header_height_px: 12,
      // left,
      left_panel_width_px: 12,
      moveable_head: true,
      movable_footer: true,
      movable_left: true,
      movable_right: true,
      // open_action,
      // parent_elm,
      ref_elm: gi(comp_mngr.xh.textarea.id), // cn(document, "xh_textarea")[0],
      resizeable: true,
      right_panel_width_px: 6,
      shadow:
        "-1px -1px 1px 0px #424242, 1px 1px 1px 0px #000000, 1px 1px 1px 0px #000000 inset, -1px -1px 1px 0px #424242 inset",
      shift_col_px: 12,
      text: main_app_colors.text_white,
      // top,
    },
    ...(saved_rect?.top
      ? {
          forced_top:
            saved_rect?.bottom >= window.innerHeight
              ? 5
              : saved_rect?.top < 0
                ? 1
                : saved_rect?.top,
        }
      : {}),
    ...(saved_rect?.left
      ? {
          forced_left:
            saved_rect?.width + saved_rect?.left >= window.innerWidth
              ? 5
              : saved_rect?.left < 0
                ? 1
                : saved_rect?.left,
        }
      : {}),
  };

  const parts_of_saved_searches_cont = buildContainer(
    saved_searches_cont_config,
  );

  // set IDs for reference in `adjustElementSize()`
  parts_of_saved_searches_cont.root_cont.setAttribute(
    "id",
    comp_mngr.savedsearchviewer.root_cont.id,
  );
  parts_of_saved_searches_cont.menu_body.setAttribute(
    "id",
    comp_mngr.savedsearchviewer.menu_body.id,
  );
  parts_of_saved_searches_cont.foot_resizer.setAttribute(
    "data-resize-id",
    `${comp_mngr.savedsearchviewer.root_cont.id},${comp_mngr.savedsearchviewer.menu_body.id}`,
  ); // overrides template

  inlineStyler(
    parts_of_saved_searches_cont.root_cont,
    `{background: ${saved_searches_cont_config.background};}`,
  );
  inlineStyler(
    parts_of_saved_searches_cont.menu_body,
    `{gap:4px; padding:2px;}`,
  );
  inlineStyler(
    tn(parts_of_saved_searches_cont.cls_btn, "svg")[0],
    `{transform:translate(0px,-1px);}`,
  );

  // build clickable option for each saved search
  const saved_search_container = buildPart(CLASS_NAME, "div");

  // set a header
  const section_label = buildPart("section-label", "label");
  saved_search_container.appendChild(section_label);
  section_label.textContent = "Searches saved in Chrome Storage";
  section_label.classList.add("display-text");
  const headers = ["Search Name", "Search Expression", "Delete search"];
  const saved_search_table = buildPart(
    comp_mngr.savedsearchviewer.saved_search_table.name,
    "table",
  );
  saved_search_table.setAttribute(
    "id",
    comp_mngr.savedsearchviewer.saved_search_table.id,
  );
  saved_search_container.appendChild(saved_search_table);

  // create table
  const thead = buildPart(CLASS_NAME, "thead");
  const header_row = buildPart(CLASS_NAME, "tr");
  headers.forEach((header) => {
    const th = buildPart(CLASS_NAME, "th");
    th.textContent = header;
    th.classList.add("theader", "display-text");
    header_row.appendChild(th);
  });
  // add a checkbox to select all search criteria at once
  const select_all_th = buildPart(CLASS_NAME, "th");
  const select_all_config = {
    checked: false,
    class_cont: {
      wrapper_cls: comp_mngr.getClassName(CLASS_NAME),
      label_cls: "center-text",
    },
    label: "Select all<br>as<br>search criteria",
    name: "select_all_search_criteria",
    wrapper_tag: "div",
  };
  const select_all_cont = createAndAppendCheckboxTo(
    header_row,
    select_all_config,
  );
  select_all_cont.classList.add("centered-flex", "flex-dir-column");
  select_all_cont.classList.replace("checkbox-wrapper", "select-all-wrapper"); // hard-coded
  select_all_cont
    .querySelector('input[type="checkbox"]')
    .addEventListener("change", async (e) => {
      try {
        const state = e.currentTarget.checked;
        /* When an event is dispatched, it goes through the event flow (capturing, target, and bubbling phases).
        Once it has been handled by the event listeners, it is considered consumed */
        let saved_searches;
        const checkboxes = ge({
          scope: gi(comp_mngr.savedsearchviewer.saved_search_table.id),
          tag: "tbody",
        }).querySelectorAll('input[type="checkbox"]');

        // toggle all checkboxes, in the:
        // - UI
        for (const cb of checkboxes) {
          cb.checked = state;
        }
        // - Chrome Storage
        saved_searches = await chrome.runtime.sendMessage({
          cmd: "toggleAllSearchCriteriaState",
          prefix: ComponentManager.XH_PREFIX,
          state: state,
        });
        // changes to the search criteria should be reflected in the FE: reset `search_mngr`
        search_mngr.setSavedSearches(saved_searches);
        await initContentProcessing();
      } catch (error) {
        console.error("Error toggling all search criteria state:", error);
      }
    });

  // append all elements to the root container
  select_all_th.appendChild(select_all_cont);
  header_row.appendChild(select_all_th);
  thead.appendChild(header_row);
  saved_search_table.appendChild(thead);
  const tbody = buildPart(CLASS_NAME, "tbody");
  saved_search_table.appendChild(tbody);
  saved_search_container.appendChild(saved_search_table);
  parts_of_saved_searches_cont.menu_body.appendChild(saved_search_container);
  gi(comp_mngr.companyviewer.root_cont.id).appendChild(
    parts_of_saved_searches_cont.root_cont,
  );

  return {
    header_row,
    saved_search_container,
    saved_search_table,
    section_label,
    select_all_cont,
    select_all_th,
    tbody,
    thead,
  };
}

export async function updateContentOfSavedSearchUI(search_records, tbody) {
  try {
    if (!tbody) {
      const root_cont = gi(comp_mngr.savedsearchviewer.root_cont.id);
      if (!root_cont) {
        const parts_of_saved_search_ui = await buildSavedSearchesViewer();
        tbody = parts_of_saved_search_ui.tbody;
      } else {
        tbody = ge({ scope: root_cont, tag: "tbody" });
      }
    }

    tbody.replaceChildren();
    if (!search_records.length) {
      gi(comp_mngr.savedsearchviewer.root_cont.id).remove();
      return;
    }

    // display the most recent search atop of the list
    search_records.forEach((rec) => {
      const { name, search_expression, timestamp } = rec; // cf. SearchManager

      const row = buildPart(CLASS_NAME, "tr");

      const search_name_td = buildPart(CLASS_NAME, "td");
      search_name_td.classList.add(
        comp_mngr.getClassName(SearchManager.NAME_KEY),
      );
      search_name_td.classList.add("display-text");
      search_name_td.textContent = name;
      search_name_td.contentEditable = "true";
      search_name_td.addEventListener("blur", async (e) => {
        try {
          const saved_searches = await chrome.runtime.sendMessage({
            cmd: "setSearchExpression",
            prefix: ComponentManager.XH_PREFIX,
            [SEARCH_EXP_KEY]: e.currentTarget.textContent.trim(),
            [TIMESTAMP_KEY]: Number(timestamp), // e.currentTarget.dataset.timestamp
          }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
          // changes to the search criteria should be reflected in the FE: reset `search_mngr`
          search_mngr.setSavedSearches(saved_searches);
        } catch (error) {
          console.error("Error setting search name:", error);
        }
      }); // rather than `input`, the blur event is triggered when the element loses focus, which typically happens when the user finishes editing the element
      row.appendChild(search_name_td);

      const search_expression_td = buildPart(CLASS_NAME, "td");
      search_expression_td.classList.add(
        comp_mngr.getClassName(SearchManager.SEARCH_EXPRESSION_KEY),
      );
      search_expression_td.textContent = search_expression;
      search_expression_td.classList.add("display-text");
      search_expression_td.contentEditable = "true";
      search_expression_td.addEventListener("blur", async (e) => {
        try {
          const saved_searches = await chrome.runtime.sendMessage({
            cmd: "setSearchExpression",
            prefix: ComponentManager.XH_PREFIX,
            [SEARCH_EXP_KEY]: e.currentTarget.textContent.trim(),
            [TIMESTAMP_KEY]: Number(timestamp), // e.currentTarget.dataset.timestamp
          }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
          // changes to the search criteria should be reflected in the FE: reset `search_mngr`
          search_mngr.setSavedSearches(saved_searches);
          await initContentProcessing();
        } catch (error) {
          console.error("Error setting search expression:", error);
        }
      }); // rather than `input`, the blur event is triggered when the element loses focus, which typically happens when the user finishes editing the element
      row.appendChild(search_expression_td);

      const delete_col = buildPart(CLASS_NAME, "td");
      const delete_wrapper = buildPart(CLASS_NAME);
      delete_wrapper.classList.add("centered-flex");
      const delete_search_input = buildPart(
        comp_mngr.savedsearchviewer.delete_search_input.name,
        "input",
      );
      setAttributes(delete_search_input, {
        type: "image",
        src: icon_delete_src,
        alt: "Delete search",
      });
      delete_search_input.dataset.timestamp = timestamp;
      delete_search_input.addEventListener("click", async () => {
        try {
          const saved_searches = await chrome.runtime.sendMessage({
            cmd: "deleteSearch",
            prefix: ComponentManager.XH_PREFIX,
            [TIMESTAMP_KEY]: Number(timestamp), // Number(e.currentTarget.dataset.timestamp), // storing in a data-* attribute coerces into a String
          }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
          // updating the search criteria in the background, should be reflected in the FE: reset `search_mngr`
          search_mngr.setSavedSearches(saved_searches);
          await updateContentOfSavedSearchUI(search_mngr.saved_searches, tbody);
          await initContentProcessing();
        } catch (error) {
          console.error("Error deleting search:", error);
        }
      });
      delete_wrapper.appendChild(delete_search_input);
      delete_col.appendChild(delete_wrapper);
      row.appendChild(delete_col);

      // search criteria checkbox
      const checkbox_cont = buildPart(CLASS_NAME, "td");
      const config = {
        id: comp_mngr.savedsearchviewer.checkbox.setId(),
        checked: false,
        class_cont: {
          wrapper_cls: "centered-flex",
        },
        label: name,
        name: "search-criterium",
        value: timestamp,
        wrapper_tag: "div",
      };
      const wrapper = createAndAppendCheckboxTo(checkbox_cont, config);
      wrapper
        .querySelector('input[type="checkbox"]')
        .addEventListener("change", async (e) => {
          try {
            const saved_searches = await chrome.runtime.sendMessage({
              cmd: "toggleSearchCriteriumState",
              prefix: ComponentManager.XH_PREFIX,
              [TIMESTAMP_KEY]: Number(e.currentTarget.value),
              state: e.currentTarget.checked,
            });
            // changes to the search criteria should be reflected in the FE: reset `search_mngr`
            search_mngr.setSavedSearches(saved_searches);
            await initContentProcessing();
          } catch (error) {
            console.error("Error toggling search criterium state:", error);
          }
        });
      row.appendChild(checkbox_cont);

      tbody.appendChild(row);
    });

    // pre-select search criteria from latest session
    tbody.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      if (!cb.value) return;

      cb.checked = search_mngr.search_criteria.find(
        (search) => search.timestamp === Number(cb.value),
      )?.[SearchManager.IS_SEARCH_CRITERIUM_KEY];
    });
  } catch (error) {
    console.error("Error updating content of saved search UI:", error);
  }
}
