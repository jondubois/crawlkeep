import { buildPart } from "./build-part.js";
import { gi } from "../../utils/web/manip-dom/modules/get-elm.js";
import {
  downloadToLocalFile,
  toFileFormat,
} from "../../utils/shared/manip-file/download-to-files/index.js";
import { notifyUser, showToast } from "../../utils/web/action-dom/index.js";

import { ComponentManager } from "../../classes/component-manager.js";
import rec_manager from "../../classes/record-manager.js";

const comp_mngr = ComponentManager.getInstance();
const PEOPLE_SEGMENT = "people";
const SEARCH_STRING = "engineer OR engineering";

/**
 * @todo - encsure singularity of each section
 */

export function buildSection(config) {
  // singleton
  // gi(comp_mngr.companyviewer.root_cont.id)?.remove(); TODO - encsure singularity of each section

  const { class_name, label, content_type } = config;

  if (!class_name || !label || !content_type) return;

  const root_cont = buildPart("section");
  root_cont.classList.add(class_name);
  const section_label = buildPart("section-label", "label");
  root_cont.appendChild(section_label);
  section_label.textContent = label;

  switch (content_type) {
    case "key-value pair":
      {
        const company_info_dl = buildPart(
          comp_mngr.companyviewer.company_info.getClassName(),
          "dl",
        );
        company_info_dl.classList.add(class_name);
        root_cont.appendChild(company_info_dl);
      }
      break;
    case "journal":
      {
        // const keyword_journal_ul = buildPart(
        //   comp_mngr.companyviewer.keyword_journal_ul.getClassName(),
        //   "ul",
        // );
        // keyword_journal_ul.setAttribute(
        //   "id",
        //   comp_mngr.companyviewer.keyword_journal_ul.id,
        // );
        // keyword_journal_ul.classList.add(class_name);
        // root_cont.appendChild(keyword_journal_ul);
      }
      break;
    case "url list":
      {
        const employee_url_ul = buildPart(class_name, "ul");
        root_cont.appendChild(employee_url_ul);
        employee_url_ul.setAttribute(
          "id",
          comp_mngr.companyviewer.employee_urls.id,
        );

        // open the company's employee page on a given search keyword
        const search_employee_btn = buildPart(
          comp_mngr.getClassName("search_employee_btn"),
          "button",
        );
        search_employee_btn.textContent = "View more employees";
        search_employee_btn.addEventListener("click", async (e) => {
          const curr_rec = rec_manager.getCurrentRecord();

          if (curr_rec && curr_rec.linkedin_url) {
            try {
              const url = new URL(curr_rec.linkedin_url);
              // append the /people/ segment to the resource path
              const pathSegments = url.pathname.split("/").filter(Boolean);
              if (pathSegments[pathSegments.length - 1] !== PEOPLE_SEGMENT) {
                pathSegments.push(PEOPLE_SEGMENT);
              }
              url.pathname = "/" + pathSegments.join("/") + "/";
              // append query parameters
              url.searchParams.set("keywords", SEARCH_STRING); // URLSearchParams API handles encoding; no need for `encodeURIComponent()`
              // open the URL in a new tab
              chrome.runtime.sendMessage({
                cmd: "openTab",
                url: url.toString(),
              });
            } catch (error) {
              console.error("Error creating URL:", error);
              notifyUser(e.target, "Error opening LinkedIn page");
            }
          } else {
            notifyUser(
              e.target,
              "No record selected or no LinkedIn URL available",
            );
          }
        });
        // wrap buttons for CSS
        const buttons_cont = buildPart(
          comp_mngr.getClassName("buttons_container"),
        );
        buttons_cont.appendChild(search_employee_btn);
        root_cont.appendChild(buttons_cont);
      }
      break;
    case "checkbox":
      {
        const curation_ul = buildPart(class_name, "ul");
        curation_ul.setAttribute("id", comp_mngr.companyviewer.curation_ul.id);
        root_cont.appendChild(curation_ul);

        // request curated list in JSON format
        const download_btn = buildPart(
          comp_mngr.getClassName("download_btn"),
          "button",
        );
        download_btn.textContent = "Download selection";
        download_btn.addEventListener("click", async (e) => {
          const curated_selections = await chrome.runtime.sendMessage({
            cmd: "getAllCuratedSelections",
            prefix: ComponentManager.COMPANY_VIEWER_PREFIX,
          }); // TODO - replace with ComponentManager.COMPANY_VIEWER_PREFIX
          if (curated_selections) {
            const filename = "curated-selections.json"; // Change this to 'data.csv', 'data.tsv', or 'data.txt' for different formats
            const { data, type } = toFileFormat(
              curated_selections.reverse(),
              filename,
            );
            downloadToLocalFile(data, type, filename);
          } else {
            gi(comp_mngr.xh.root_cont.id);
            showToast(
              e.target,
              "Characterise records first: select criteria in the list and scroll to a new record with your mouse wheel",
              gi(comp_mngr.xh.root_cont.id),
            ); /* `e.target` or download_btn because event listener is detached before the async operation completes,
            so `.currentTarget` returns `null` */
          }
        });

        // reset all user's curations
        const reset_btn = buildPart(
          comp_mngr.getClassName("reset_btn"),
          "button",
        );
        reset_btn.textContent = "Reset";
        reset_btn.addEventListener("click", async (e) => {
          const status = await chrome.runtime.sendMessage({
            cmd: "deleteAllCuratedSelections",
            prefix: ComponentManager.COMPANY_VIEWER_PREFIX,
          });

          if (status.success) {
            notifyUser(e.target, "Done");
          } else {
            console.warn(status.message);
            alert(`Error: ${status.message}`);
          }
        });

        // wrap buttons for CSS
        const buttons_cont = buildPart(
          comp_mngr.getClassName("buttons_container"),
        );
        buttons_cont.appendChild(reset_btn);
        buttons_cont.appendChild(download_btn);
        root_cont.appendChild(buttons_cont);
      }
      break;
    default:
      console.warn(
        `${buildSection.name} - Unknown content type: ${content_type}`,
      );
  }
  return {
    // buttons_cont,
    // company_info_dl,
    // download_btn,
    // employee_url_ul,
    // keyword_journal_ul,
    // reset_btn,
    // curation_ul,
    root_cont,
    section_label,
  };
}
