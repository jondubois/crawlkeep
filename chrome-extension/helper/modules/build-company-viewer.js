import {
  a,
  ge,
  gi,
  inlineStyler,
  setStyles,
  createAndAppendDtDdTo,
  createAndAppendDtDdAnchorTo,
  createAndAppendLiAnchorTo,
} from "../../utils/web/manip-dom/index.js";
import { handleFiles } from "../../utils/shared/manip-file/file-reader/modules/handle-files.js";
import { setMainCss } from "../../css.js";
import {
  buildSection,
  buildXhighlightherUI,
  buildContainer,
  buildPart,
} from "../index.js";
import { getValAtNodeCascading } from "../../utils/shared/manip-node/modules/get-val-at-node-cascading.js";
import { initContentProcessing } from "../../init/modules/init-content-processing.js";
import { setDir } from "../../utils/web/manip-keyboard/modules/input-key-up.js";
import { deDupArr } from "../../utils/shared/manip-arr/modules/misca.js";
import { toSingularNoun } from "../../utils/shared/manip-str/modules/to-plural-or-singular-noun.js";

// instanciate classes
import SearchManager from "../../classes/search-manager.js";
import { LookupProps } from "../../classes/base/base-entity.js";
import { ComponentManager } from "../../classes/component-manager.js";
import { SpinnerManager } from "../../classes/spinner-manager.js";
const lookup_props = LookupProps.getInstance();
const comp_mngr = ComponentManager.getInstance();
const search_mngr = SearchManager.getInstance();
import rec_manager from "../../classes/record-manager.js";

// URL components
const url_rx = new RegExp(
  "^(?<protocol>https?:\\/\\/)?" +
    "((?<subdomain>[a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*" +
    "(?<domain>[a-z\\d]([a-z\\d-]*[a-z\\d])*)" + // domain
    "\\.(?<tld>[a-z]{2,})" + // top-level domain (e.g .com, .org, .net, etc)
    "(\\:(?<port>\\d+))?" +
    "(?<path>\\/[-a-z\\d%_.~+]*)*" +
    "(\\?(?<query>[;&a-z\\d%_.~+=-]*))?" +
    "(\\#(?<fragment>[-a-z\\d_]*))?$",
  "i",
);

export const sub_div_configs = [
  {
    class_name: comp_mngr.companyviewer.company_info.getClassName(),
    label: "Company Info",
    content_type: "key-value pair",
    keys: [
      ...lookup_props.company_name_keys,
      ...lookup_props.company_url_keys,
      ...lookup_props.company_description_keys,
      ...lookup_props.company_numeric_keys,
      ...lookup_props.company_location_keys,
    ],
  },
  // {
  //   class_name: comp_mngr.getClassName("company_numeric"), //  hard-coded,
  //   label: "Company Numbers",
  //   content_type: "key-value pair",
  //   keys: lookup_props.company_numeric_keys,
  // },
  // {
  //   class_name: comp_mngr.getClassName("company_locations"), //  hard-coded,
  //   label: "Company Locations",
  //   content_type: "key-value pair",
  //   keys: lookup_props.company_location_keys,
  // },
  // {
  //   class_name: comp_mngr.companyviewer.keyword_journal_ul.getClassName(),
  //   label: "Matching keywords",
  //   content_type: "journal",
  //   keys: [],
  // },
  {
    class_name: comp_mngr.companyviewer.employee_urls.getClassName(),
    label: "Links to employee profiles",
    content_type: "url list",
    keys: [],
  },
  {
    class_name: comp_mngr.companyviewer.matching_search_criteria.getClassName(),
    label: "Select criteria that characterise the record",
    content_type: "checkbox",
    keys: [],
  },
];
const EMPLOYEE_ID_KEY = "employee_ids";
const EMPLOYEE_URL_REL_PATH = "https://www.linkedin.com/in/";

export async function buildCompanyViewer() {
  // singleton
  const cpy_viewer_main_cont_id = comp_mngr.companyviewer.root_cont.id;
  gi(cpy_viewer_main_cont_id)?.remove();
  gi(comp_mngr.savedsearchviewer.root_cont.id)?.remove();

  await search_mngr.init();

  const saved_rect = await chrome.runtime.sendMessage({
    cmd: "getLatestRect",
    id: cpy_viewer_main_cont_id,
  }); /* in Manifest V3, `runtime.sendMessage()` can return a `Promise` https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage
    if the receiver also returns a `Promise`.
    However, `Promise` as a return value is not supported in Chrome until Chrome bug 1185241 (https://issues.chromium.org/issues/40753031) is resolved.
    As an alternative, use `sendResponse()` and `return true`, which is effectively the same as returning a `Promise` (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse)
    `Promise` and callback cannot be used simultaneously on the same function call.
    Hence, a callback was used in the emitter, which enables the return of a `Promise`
    Therefore, there's no need to declare `requestFromBackground()` as async, nor wrap its return value in a `Promise`.
    The `Promise` returned by the receiver can be directly passed on */

  const template_main_cont_config = await chrome.runtime.sendMessage({
    cmd: "getTemplateConfig",
  });
  const cpy_viewer_config = {
    ...template_main_cont_config,
    ...{
      // application_label,
      // background,
      // background_color:,
      // border_px,
      // border_radius_px:,
      // close_action,
      // close_btn_px:,
      container_id: cpy_viewer_main_cont_id,
      // footer_height_px:,
      // force_left,
      // force_top,
      // gradient_bg,
      // header_height_px:,
      // left,
      // left_panel_width_px: ,
      // moveable_head: false,
      // movable_footer: false,
      // movable_left: false,
      // movable_right: false,
      // open_action,
      // parent_elm,
      // ref_elm,
      // resizeable: false,
      // right_panel_width_px: ,
      // shadow:,
      // shift_col_px: ,
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
  const parts_of_cpy_viewer_main_container = buildContainer(cpy_viewer_config);
  setMainCss(`${cpy_viewer_config.container_id}-css`);

  // for the `keyup` event to bubble up, `root_cont` must be focusable
  parts_of_cpy_viewer_main_container.root_cont.setAttribute("tabindex", "0");
  parts_of_cpy_viewer_main_container.root_cont.addEventListener(
    "keyup",
    setDir,
  );
  parts_of_cpy_viewer_main_container.root_cont.focus();

  // keepContInBoundary(parts_of_cpy_viewer_main_container.root_cont);
  // add file uploader for user to select and upload files
  const file_upload_elm = buildPart("file-uploader", "input");
  a(file_upload_elm, [
    ["type", "file"],
    ["name", "file[]"],
    ["multiple", "true"],
  ]);
  parts_of_cpy_viewer_main_container.menu_body.appendChild(file_upload_elm);
  parts_of_cpy_viewer_main_container.cls_btn.addEventListener("click", () => {
    const component_prefixes = [
      ComponentManager.SAVED_SEARCH_VIEWER_PREFIX,
      ComponentManager.XH_PREFIX,
      ComponentManager.COMPANY_VIEWER_PREFIX,
      ComponentManager.TEMPLATE_PREFIX,
    ];
    component_prefixes.forEach((prefix) => {
      gi(comp_mngr.getId("root_cont", prefix))?.remove();
    });
  });

  // display company info, one by one, to the UI
  file_upload_elm.addEventListener("change", async (event) => {
    /*****************************************************************Build Company Viewer***************************************************************************************/
    // const contents = await handleFiles(event);
    rec_manager.setRecords(await handleFiles(event));
    parts_of_cpy_viewer_main_container.menu_body.replaceChildren(); // resets the content of the viewer (https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren#emptying_a_node)
    inlineStyler(
      parts_of_cpy_viewer_main_container.menu_body,
      `{
        max-height: 98vh;
        }`,
    ); // overwrites template
    parts_of_cpy_viewer_main_container.menu_body.classList.add(
      ComponentManager.COMPANY_VIEWER_PREFIX,
    );

    // create a viewing panel to display the content
    const content_viewer = buildPart(
      comp_mngr.companyviewer.content_viewer.name,
    );
    content_viewer.setAttribute(
      "id",
      comp_mngr.companyviewer.content_viewer.id,
    ); // ID set for future reference "content-viewer";

    // build sub-divisions and append to viewing panel
    const all_sections = sub_div_configs.map(buildSection);
    all_sections.forEach((parts_of_section_cont) =>
      content_viewer.appendChild(parts_of_section_cont.root_cont),
    );
    parts_of_cpy_viewer_main_container.menu_body.replaceChildren(
      content_viewer,
    );

    // build xH UI
    const parts_of_xh_ui = await buildXhighlightherUI();
    parts_of_cpy_viewer_main_container.menu_body.appendChild(
      parts_of_xh_ui.root_cont,
    );

    // override to re-position the main container
    const DEFAULT_WIDTH_PC = 60; // 60% of the screen width
    setStyles(parts_of_cpy_viewer_main_container.root_cont, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: `${screen.width < 1024 ? "100vw" : `${DEFAULT_WIDTH_PC}vw`}`, // "1024px", window.innerWidth //
      height: "100vh", // full height of the viewport
    });
    parts_of_cpy_viewer_main_container.foot_resizer.remove();

    /************************************************************Initialise display of content***********************************************************************************/
    const updateViewerContent = async () => {
      const rec = rec_manager.getCurrentRecord();

      if (!rec) {
        // scroll down
        rec_manager.setRecordIndex(
          Math.min(
            rec_manager.getRecordIndex() + 1, // index is either initialised OR, was updated on mouse scroll
            rec_manager.getRecordsLength() - 1,
          ),
        );
        return;
      }

      // from `${msg.key}_curated_selections`, tap into the relevant expertise within "skillset" to get the EMPLOYEE_ID_KEY
      const employee_ID_containers = search_mngr.search_criteria
        .flatMap((crit) =>
          getValAtNodeCascading(rec, [
            "added_props",
            "inferred",
            "skillset",
            crit[SearchManager.NAME_KEY],
            EMPLOYEE_ID_KEY,
          ]),
        )
        .filter(Boolean);
      // const employee_ID_containers = getLeafNodesCascadingDFT(rec).flatMap((obj) =>
      //   obj?.[EMPLOYEE_ID_KEY] ? obj[EMPLOYEE_ID_KEY] : [],
      // );

      for (const config of sub_div_configs) {
        const { class_name, content_type } = config;

        if (!class_name || !content_type) return;

        switch (content_type) {
          case "key-value pair":
            {
              const company_info_dl = ge({
                scope: content_viewer,
                class_name: class_name,
                tag: "dl",
              });
              company_info_dl.replaceChildren();
              config.keys.forEach((key) => {
                if (!rec[key]) return;
                if (url_rx.test(rec[key])) {
                  createAndAppendDtDdAnchorTo(company_info_dl, {
                    parent_cont: company_info_dl,
                    class_name: class_name,
                    term: key,
                    url: rec[key],
                    is_wrapped: true,
                  });
                } else {
                  createAndAppendDtDdTo(company_info_dl, {
                    class_name: class_name,
                    term: key,
                    description: rec[key],
                    is_wrapped: true,
                  });
                }
              });
            }
            break;
          case "journal":
            break;
          case "url list":
            {
              const employee_url_ul = ge({
                scope: content_viewer,
                class_name: class_name,
                tag: "ul",
              });
              employee_url_ul.replaceChildren();

              const uniq_employee_ids = deDupArr(
                employee_ID_containers.map(
                  (id_obj) => id_obj["public_id"] ?? id_obj["member_id"],
                ),
              );
              uniq_employee_ids.forEach((id) => {
                createAndAppendLiAnchorTo(employee_url_ul, {
                  class_name: toSingularNoun(class_name),
                  href: EMPLOYEE_URL_REL_PATH.concat(id),
                  content: id,
                });
              });
            }
            break;
          case "checkbox":
            // await updateCurationCheckboxList(
            //   search_mngr.search_criteria,
            //   [],
            //   curr_record_i,
            // );
            break;
          default:
            console.warn(`Unknown content type: ${content_type}`);
        }
      } /* to handle `await updateCurationCheckboxList(`, updateViewerContent() needs to be async.
      Given the `await` is in the body of a loop,
      it had to be a loop (e.g. for...of, for await...of, while, do-while, etc) that allows async operations to be executed sequentially
      as it waits for Promise in its body to resolve before proceeding to the next iteration */
    };
    let is_processing_on = false;
    // initialise loading spinner
    const spinner_parent = gi(
      comp_mngr[ComponentManager.COMPANY_VIEWER_PREFIX].content_viewer.id,
    );
    let spinner = new SpinnerManager(spinner_parent);
    // update content of the viewer, with a new record, on mouse scroll
    const wheelEventHandle = async (event) => {
      event.preventDefault();

      let curr_record_i = rec_manager.getRecordIndex(); // index is updated on mouse scroll
      const rec = rec_manager.getCurrentRecord();

      if (!rec) {
        if (event.deltaY > 0) {
          // scroll down
          curr_record_i = Math.min(
            curr_record_i + 1,
            rec_manager.getRecordsLength() - 1,
          );
        } else {
          // scroll up
          curr_record_i = Math.max(curr_record_i - 1, 0);
        }
        rec_manager.setRecordIndex(curr_record_i);
        return;
      }

      /* safeguard: 
      - against race conditions: before the listener is removed other wheel events could happen.
      The flag prevents concurrent processing
      - defensive programming: the flag provides a backup protection mechanism
      */
      if (is_processing_on) return;

      is_processing_on = true;
      parts_of_cpy_viewer_main_container.root_cont.removeEventListener(
        "wheel",
        wheelEventHandle,
      );

      spinner.show();

      try {
        // update in Chrome Storage the user's curation of the current record..
        const curated_labels = Array.from(
          ge(comp_mngr.companyviewer.curation_ul).querySelectorAll(
            'input[type="checkbox"]',
          ),
        )
          .filter((cb) => cb.checked)
          .map(
            (cb) =>
              document.querySelector(`label[for="${cb.id}"]`)?.textContent,
          )
          .filter(Boolean);
        await chrome.runtime.sendMessage({
          cmd: "saveCuratedSelection",
          prefix: ComponentManager.COMPANY_VIEWER_PREFIX,
          i: curr_record_i,
          cpy_id:
            // try out all possible ID to get the company URL
            rec?.[lookup_props.company_id_keys.find((k) => rec[k])] ??
            rec?.["linkedin_url"].match(/\d+/)?.shift(),
          curated_labels,
        });

        // ..before moving onto the next record, ..
        if (event.deltaY > 0) {
          // scroll down
          curr_record_i = Math.min(
            curr_record_i + 1,
            rec_manager.getRecordsLength() - 1,
          );
        } else {
          // scroll up
          curr_record_i = Math.max(curr_record_i - 1, 0);
        }
        rec_manager.setRecordIndex(curr_record_i);

        // ..which becomes the one currently displayed
        await updateViewerContent();
        await initContentProcessing();
      } finally {
        // reset
        is_processing_on = false;
        parts_of_cpy_viewer_main_container.root_cont.addEventListener(
          "wheel",
          wheelEventHandle,
        );
        spinner.hide();
      }
    };
    parts_of_cpy_viewer_main_container.root_cont.addEventListener(
      "wheel",
      wheelEventHandle,
    );
    await updateViewerContent();
    await initContentProcessing();
  });
  return {
    ...parts_of_cpy_viewer_main_container,
    file_upload_elm,
  };
}
