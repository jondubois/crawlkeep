import {
  gi,
  ge,
  removeParentKeepChildrenBy,
  createAndAppendLiTo,
  updateActiveIndex,
} from "../../utils/web/manip-dom/index.js";
import { updateCurationCheckboxList } from "../../helper/modules/update-curation-checkbox-list.js";
import { tryRegExp } from "../../utils/shared/manip-str/modules/try-regexp.js";
import { buildSearchSet } from "../../boolean-string-parser.js";
import { highlightHelper1 } from "../../helper/modules/run-highlighter.js";

// instantiate classes
import { ComponentManager } from "../../classes/component-manager.js";
import SearchManager from "../../classes/search-manager.js";
const comp_mngr = ComponentManager.getInstance();
const search_mngr = SearchManager.getInstance();

// set variables
const RX_FLAG = "im";
const SEARCH_EXP_KEY = SearchManager.SEARCH_EXPRESSION_KEY;

/**
 * @todo - gi(comp_mngr.xh.textarea.id).value is reset to `` in `save_btn.onclick`
 * @todo - update employee URLs panel
 */
export async function initContentProcessing(
  textarea_input_search_criterium = [],
) {
  removeParentKeepChildrenBy(ComponentManager.HIGHLIGHTED_CLASS);
  const search_criteria = search_mngr.search_criteria.concat(
    textarea_input_search_criterium,
  );

  // highlight matching keywords and pre-check matching taxo categories
  const class_selector = `.${[
    comp_mngr.companyviewer.company_info.getClassName(),
    "prop-wrapper",
    "value",
  ].join(" .")}`;

  const to_be_highlighted_nodes = Array.from(
    gi(comp_mngr.companyviewer.content_viewer.id).querySelectorAll(
      class_selector,
    ),
  );
  let search_expression = "";
  let search_type = "";
  let regex;
  let num_matches_total = 0;
  let unique_match_set = new Set();
  let ini_set_size = 0;
  const matching_criteria_labels = [];

  // `search_mngr` would have been initialized OR reset, prior
  // `.reverse()` so the hue attributed to each search remains, even after adding new search criteria to the selection
  search_criteria.reverse().forEach((crit, i) => {
    ini_set_size = unique_match_set.size;
    if (Object.prototype.hasOwnProperty.call(crit, SEARCH_EXP_KEY)) {
      // if search object stored in Chrome Storage,
      // then inform user where highlighting comes from
      // // crit[SEARCH_EXP_KEY] !== undefined
      // gi(comp_mngr.xh.textarea.id).value = crit[SEARCH_EXP_KEY]; // TODO - the value is reset to `""` in `save_btn.onclick`
      search_expression = crit[SEARCH_EXP_KEY];
      search_type = crit[SearchManager.TYPE_KEY];
    } else {
      // user input
      search_expression = gi(comp_mngr.xh.textarea.id).value.trim();
      search_type = gi(comp_mngr.xh.toggle_indicator.id)?.getAttribute(
        ComponentManager.TOGGLE_STATE,
      );
    }

    if (
      search_expression &&
      !/"$|\($/.test(search_expression) &&
      !/^[\.]+$|^$/.test(search_expression)
    ) {
      if (search_type === "regex") {
        regex = tryRegExp(search_expression, RX_FLAG);
        // regexes = search_expression
        //   .split(/\n/)
        //   .map((d) => tryRegExp(d, RX_FLAG))
        //   .flat();
      } else {
        regex = buildSearchSet(search_expression, RX_FLAG);
        // regexes = search_expression
        //   .split(/\n/)
        //   .map((d) => buildSearchSet(d, RX_FLAG))
        //   .flat();
      }
    }

    const matches = to_be_highlighted_nodes.flatMap(
      (target_elm) => highlightHelper1({ index: i, target_elm, regex }) || [],
    ); // flattens and filters out empty returned results and RegExps
    matches.filter(Boolean).forEach((kw) => {
      ++num_matches_total;
      unique_match_set.add(kw);
    });

    if (unique_match_set.size > ini_set_size) {
      matching_criteria_labels.push(crit.name);
    }
  });

  // TODO - update employee URLs panel

  /* update curation panel:
  - to reflect the latest selection of search criteria
  - from matching keywords, pre-select curation checkboxes against the respective matching criteria */
  await updateCurationCheckboxList(search_criteria, matching_criteria_labels);

  if (unique_match_set.size > 0) {
    // visually distinguish the first search result from the rest
    const first_search_result = document.querySelector(
      `.${ComponentManager.HIGHLIGHTED_CLASS}`,
    ); // `.querySelector()` returns the first element that matches the specified selector
    first_search_result?.classList.add("active");
  }

  // update count container
  updateActiveIndex();
  const match_total_cont = ge({
    scope: gi(comp_mngr.xh.count_cont.id),
    class_name: comp_mngr.getClassName("match_total"),
  });
  match_total_cont.innerText = num_matches_total;

  // // update keyword journal
  // const keyword_journal_ul = gi(comp_mngr.companyviewer.keyword_journal_ul.id);
  // if (keyword_journal_ul) {
  //   keyword_journal_ul.replaceChildren();
  //   unique_match_set.forEach((kw) =>
  //     createAndAppendLiTo(keyword_journal_ul, {
  //       class_name: comp_mngr.getClassName("matching_keyword_wrapper"),
  //       text_content: kw,
  //     }),
  //   );
  // }
}
