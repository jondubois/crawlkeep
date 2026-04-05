import { buildPart } from "./build-part.js";
import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

/**
 * Creates and returns a spinner element
 * @returns {Object} - An object containing references to web HTML elements within the container
 */
export function buildLoadingSpinner() {
  const root_cont = buildPart(comp_mngr.getClassName("loading_spinner"));
  const spinner_icon = buildPart(comp_mngr.getClassName("spinner_icon"));
  root_cont.appendChild(spinner_icon);

  return { root_cont, spinner_icon };
}
