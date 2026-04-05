import { gi } from "../manip-dom/modules/get-elm.js";
import { buildLoadingSpinner } from "../components/modules/build-loading-spinner.js";
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
  #longTaskListener = null;
  #setupLongTaskDetection() {
    this.#longTaskListener = (event) => {
      requestAnimationFrame(() => this.show());
    }; /* `requestAnimationFrame` yields control to the browser so it can update the UI.
    Thereby displaying the spinner, even if the main thread is busy. */
    document.addEventListener("longTaskDetected_id0", this.#longTaskListener);
  }

  /**
   * Creates a single spinner instance for each target element
   * @param {HTMLElement} target_elm - The element to which the spinner will be attached
   */
  constructor(target_elm = document.body) {
    // singleton pattern per target element (a one-to-one relationship between the target element and its associated spinner)
    const existing_spinner = SpinnerManager.getBy(target_elm);
    if (existing_spinner) {
      return existing_spinner;
    }

    this.target_elm = target_elm;
    this.root_cont = null;
    this.id = null;
    this.initialise();
    this.#setupLongTaskDetection(); // single responsibility principle
  }

  initialise() {
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
      this.target_elm.appendChild(this.root_cont);
    }

    // register this instance
    SpinnerManager.#instances.set(this.id, this);
  }

  destroy() {
    // clear event listener
    if (this.#longTaskListener) {
      document.removeEventListener(
        "longTaskDetected_id0",
        this.#longTaskListener,
      );
      this.#longTaskListener = null;
    }
    // remove from registry
    SpinnerManager.#instances.delete(this.id);
    // remove from DOM
    if (this.root_cont?.parentNode) {
      this.root_cont.parentNode.removeChild(this.root_cont);
    }
    // remove from display
    this.hide();
  }

  static getBy(target_elm) {
    return Array.from(this.#instances.values()).find(
      (spinner) => spinner.target_elm === target_elm,
    );
  }

  static getById(id) {
    return this.#instances.get(id);
  }

  show() {
    if (!this.target_elm || !this.root_cont) return this;

    this.target_elm.classList.add("disabled");
    this.root_cont.classList.add("show");
    return this;
  }

  hide() {
    if (!this.target_elm || !this.root_cont) return this;

    this.target_elm.classList.remove("disabled");
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
