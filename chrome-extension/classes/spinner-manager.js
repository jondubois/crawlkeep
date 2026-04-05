import { gi } from "../utils/web/manip-dom/modules/get-elm.js";
import { buildLoadingSpinner } from "../helper/modules/build-loading-spinner.js";
import { ComponentManager } from "./component-manager.js";
const comp_mngr = ComponentManager.getInstance();

/**
 * Manages loading spinner visibility
 */
export class SpinnerManager {
  static #instances =
    new Map(); /* initializes the `Map` only once when the class is defined, not at each instantiation.
    The `static` keyword means this property belongs to the class itself, not to instances.
    Subsequently, they all share a single `Map` */
  // #longTaskListener = null;
  // #setupLongTaskDetection() {
  //   this.#longTaskListener = (event) => {
  //     requestAnimationFrame(() => this.show());
  //   }; /* `requestAnimationFrame` yields control to the browser so it can update the UI.
  //   Thereby displaying the spinner, even if the main thread is busy. */
  //   document.addEventListener("longTaskDetected_id0", this.#longTaskListener);
  // }
  #initialise() {
    this.id = comp_mngr.setId(
      "root_cont",
      ComponentManager.SPINNER_PREFIX,
    ); /* given `buildLoadingSpinner()` comprises only of one `root_cont`,
    AND `this.root_cont = root_cont;`
    AND `this.root_cont.setAttribute("id", this.id);`
    we ensure that the ID is allocated to an actual spinner element.
    `setId()` checks the document to determine the next `index` increment.
    Hence, the next ID should be allocated to a new Spinner associated to a different target element,
    thereby enforcing the singleton pattern per target element */
    this.root_cont = gi(this.id);

    if (!this.root_cont) {
      const { root_cont } = buildLoadingSpinner();
      this.root_cont = root_cont;
      this.root_cont.setAttribute("id", this.id);
      this.parent_elm.appendChild(this.root_cont);
    }

    this.#addSpinnerIdTo(this.parent_elm, this.id);
    // register this instance
    SpinnerManager.#instances.set(this.id, this);
  }

  #addSpinnerIdTo(parent_elm, id) {
    try {
      const spinner_ids = JSON.parse(parent_elm.dataset.spinnerIds || "[]");

      if (!spinner_ids.includes(id)) {
        spinner_ids.push(id);
        parent_elm.dataset.spinnerIds = JSON.stringify(spinner_ids); // serializes current spinner IDs
      }
    } catch (error) {
      // fallback
      // console.error("Error storing spinner ID in dataset:", error);
      parent_elm.dataset.spinnerIds = JSON.stringify([id]);
    }
  }

  #deleteSpinnerIdFrom(parent_elm, id) {
    if (!parent_elm) return;

    const kept_ids = JSON.parse(parent_elm.dataset.spinnerIds || "[]").filter(
      (spinner_id) => spinner_id !== id,
    );

    if (!kept_ids.length) {
      // remove the attribute entirely if empty
      delete parent_elm.dataset.spinnerIds;
    } else {
      parent_elm.dataset.spinnerIds = JSON.stringify(kept_ids);
    }
  }

  /**
   * Creates a single spinner instance for each target element
   * @param {HTMLElement} parent_elm - The element to which the spinner will be attached
   */
  constructor(parent_elm = document.body) {
    this.parent_elm = parent_elm;
    this.root_cont = null;
    this.id = null;
    this.#initialise();
  }

  destroy() {
    // remove from display
    this.hide();

    // // clear event listener
    // if (this.#longTaskListener) {
    //   document.removeEventListener(
    //     "longTaskDetected_id0",
    //     this.#longTaskListener,
    //   );
    //   this.#longTaskListener = null;
    // }

    // remove spinner ID from parent element
    if (this.parent_elm) {
      this.#deleteSpinnerIdFrom(this.parent_elm, this.id);
    }

    // remove from registry
    SpinnerManager.#instances.delete(this.id);

    // remove from DOM
    if (this.root_cont?.parentNode) {
      this.root_cont.parentNode.removeChild(this.root_cont);
    }
  }

  static getById(id) {
    return this.#instances.get(id);
  }

  show() {
    if (!this.parent_elm || !this.root_cont) return this;

    this.parent_elm.classList.add("disabled");
    this.root_cont.classList.add("show");
    return this;
  }

  hide() {
    if (!this.parent_elm || !this.root_cont) return this;

    this.parent_elm.classList.remove("disabled");
    this.root_cont.classList.remove("show");
    return this;
  }

  is_visible() {
    return this.root_cont?.classList.contains("show") || false;
  }

  toggle() {
    return this.is_visible() ? this.hide() : this.show();
  }
}
