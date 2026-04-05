import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

export function buildPart(elm_name, tag = "div") {
  const elm = document.createElement(tag);
  elm.classList.add(comp_mngr.getClassName(elm_name)); // can be aggregated with eventually existing classes
  return elm;
}
