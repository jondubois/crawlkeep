export class ComponentManager {
  static instance = null;

  static SPINNER_PREFIX = "spinner";
  static COMPANY_VIEWER_PREFIX = "companyviewer";
  static SAVED_SEARCH_VIEWER_PREFIX = "savedsearchviewer";
  static TEMPLATE_PREFIX = "template";
  static XH_PREFIX = "xh";
  static NON_VAR_SEPARATOR = "-";
  // static HIGHLIGHTED_TAG = "i";
  static HIGHLIGHTED_CLASS = "highlight-search-res";
  static TOGGLE_STATE = "togglestate";

  static spinner_parts = new Set(["root_cont", "spinner_icon"]);

  static saved_search_viewer_parts = new Set([
    "checkbox",
    "saved_search_table",
    "delete_search_input",
    "menu_body",
    "root_cont",
  ]); /*
  code: root_cont, menu_body, delete_search_input,
  ID: saved_search_table,
  tracking: `saved_search` is not an actual part, but needs to be tracked by ID
  CSS: definition_list,  */

  static xh_parts = new Set([
    "always_open",
    "count_cont",
    "cls_btn",
    "head_mover",
    "open_saved_btn",
    "root_cont",
    "saved_search_name_input",
    "textarea",
    "toggle_cont",
    "toggle_indicator",
    // "toggle_text_type",
  ]);
  // code: always_open, count_cont, head_mover, open_saved_btn, root_cont, textarea, toggle_cont, toggle_indicator
  // ID: saved_search_name_input
  // CSS: cls_btn

  static company_viewer_parts = new Set([
    "content_viewer",
    "company_info",
    "checkbox",
    "curation_ul",
    "employee_urls",
    // "employee_list",
    // "file_uploader",
    // "keyword_journal_ul",
    "matching_search_criteria",
    "root_cont",
  ]); /* 
  code: content_viewer, company_info, checkbox (to link checkbox to its label), curation_ul, keyword_journal_ul, matching_search_criteria, root_cont
  CSS:  employee_urls */

  static template_parts = new Set([
    "cls_btn",
    "footer",
    "foot_resizer",
    "head_mover",
    "header",
    "left_dragger",
    "left_side",
    "menu_body",
    "middle_cont",
    "right_dragger",
    "right_side",
    "right_top_btn",
    "root_cont",
    "top_label",
  ]);

  constructor() {
    if (ComponentManager.instance) {
      return ComponentManager.instance;
    }

    this.NON_VAR_SEPARATOR = ComponentManager.NON_VAR_SEPARATOR;
    this.initialiseParts();

    ComponentManager.instance = this;
  }

  static getInstance() {
    if (!ComponentManager.instance) {
      ComponentManager.instance = new ComponentManager();
    }
    return ComponentManager.instance;
  }

  initialiseParts() {
    this.initializeSet(
      ComponentManager.spinner_parts,
      ComponentManager.SPINNER_PREFIX,
    );
    this.initializeSet(ComponentManager.xh_parts, ComponentManager.XH_PREFIX);
    this.initializeSet(
      ComponentManager.saved_search_viewer_parts,
      ComponentManager.SAVED_SEARCH_VIEWER_PREFIX,
    );
    this.initializeSet(
      ComponentManager.company_viewer_parts,
      ComponentManager.COMPANY_VIEWER_PREFIX,
    );
    this.initializeSet(
      ComponentManager.template_parts,
      ComponentManager.TEMPLATE_PREFIX,
    );
  }

  initializeSet(part_names, prefix) {
    this[prefix] ??= {};
    Array.from(part_names).forEach((part_name) => {
      this[prefix][part_name] = {
        getClassName: () => this.getClassName(part_name),
        id: this.setId(part_name, prefix),
        name: part_name,
        setId: () => this.setId(part_name, prefix),
      };
    });
  }

  getClassName(part_name) {
    if (typeof part_name !== "string") {
      throw new TypeError(
        `${
          this.constructor.name
        }.getClassName - Invalid input. Expected ${part_name} to be a String. Instead, was passed ${typeof part_name}`,
      );
    }
    return part_name.replace(/_/g, this.NON_VAR_SEPARATOR);
  }

  getId(part_name, prefix = "") {
    return this[prefix]?.[part_name]?.id;
  }

  setId(part_name, prefix = "") {
    let index = 0;
    let new_id;
    while (
      document.getElementById(
        (new_id = [prefix, this.getClassName(part_name), index].join(
          this.NON_VAR_SEPARATOR,
        )),
      )
    ) {
      index++;
    }
    this[prefix] ??= {};
    this[prefix][part_name] = {
      ...this[prefix][part_name],
      id: new_id,
    };
    return new_id;
  }
}
