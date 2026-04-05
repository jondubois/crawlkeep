import {
  gi,
  createAndAppendCheckboxTo,
} from "../../utils/web/manip-dom/index.js";

import rec_manager from "../../classes/record-manager.js";
import SearchManager from "../../classes/search-manager.js";
import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

export async function updateCurationCheckboxList(
  search_criteria = [],
  matching_criteria_labels = [],
) {
  const curation_ul = gi(comp_mngr.companyviewer.curation_ul.id);
  curation_ul.replaceChildren();

  // display the most recent search atop of the list
  search_criteria.forEach((search_obj) => {
    const config = {
      id: comp_mngr.companyviewer.checkbox.setId(),
      checked: false,
      class_cont: {
        wrapper_cls:
          comp_mngr.companyviewer.matching_search_criteria.getClassName(),
      },
      label: search_obj[SearchManager.NAME_KEY],
      name: "search_criterium",
      value: search_obj[SearchManager.TIMESTAMP_KEY],
      wrapper_tag: "li",
    };
    const wrapper = createAndAppendCheckboxTo(curation_ul, config);
    wrapper
      .querySelector('input[type="checkbox"]')
      .addEventListener("change", async (e) => {
        await chrome.runtime.sendMessage({
          cmd: "toggleSearchCriteriumState",
          prefix: ComponentManager.XH_PREFIX,
          [SearchManager.TIMESTAMP_KEY]: Number(e.currentTarget.value),
          state: e.currentTarget.checked,
        });
      });
  });

  /*
  `RecordManager` stores the index of the record currenlty in view.
  If the mouse wheel is toggled, hence `curr_record_i` changes, then `RecordManager` updates the index to that of the new record.
  If `initContentProcessing()` was triggered from:
  1- Not toggling the wheel
    - `buildCompanyViewer()`: content loaded for the first time,
    - `xhInputKeyUp()`: user inputting a new search criteria in textarea,
    - `buildSavedSearchesViewer()`: user toggling "Select All"
    - `updateContentOfSavedSearchUI()`, by the user:
        - (de)selecting search criteria,
        - updating the content of the search expression,
        - deleting a search record,
    - `buildXhighlightherUI()`: user toggling switch of search type (e.g. bool, regex)
    which is done without toggling the wheel,
    then Chrome Storage is queried with the index of the record currently displayed.
  2- Toggling the wheel
    - `updateViewerContent()`: record is changed,
  then Chrome Storage is queried with the index of the record displayed after wheel scroll.
  Thereby, any eventual pre-existing user's curation is preserved.
  */
  // check Chrome Storage for an existing user's curation
  const existing_rec = await chrome.runtime.sendMessage({
    cmd: "getCuratedSelection",
    prefix: ComponentManager.COMPANY_VIEWER_PREFIX,
    i: rec_manager.getRecordIndex(),
  });

  // handle persistency of user's curation
  const checkboxes = curation_ul.querySelectorAll('input[type="checkbox"]');
  const toggleCheckboxes = (labels) => {
    checkboxes.forEach((cb) => {
      const checkbox_label = document.querySelector(
        `label[for="${cb.id}"]`,
      )?.textContent;
      cb.checked = labels.some((name) => name === checkbox_label); // if `labels` is an empty array, then `some()` returns `false` ie. no checkbox is checked
    });
  };
  if (existing_rec) {
    // overwrite default pre-selection with existing user's curation
    toggleCheckboxes(existing_rec.curated_labels);
  } else {
    // pre-select the curation checkboxes against matching criteria
    toggleCheckboxes(matching_criteria_labels);
  }
}
