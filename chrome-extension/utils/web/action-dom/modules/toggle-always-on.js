import { inlineStyler, gi } from "../../manip-dom/index.js";

import { ComponentManager } from "../../../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

export async function toggleAlwaysOn(e) {
  let always_open = e ? e.currentTarget : gi(comp_mngr.xh.always_open.id); // default fallback
  let state = always_open.getAttribute("data-always-open");
  if (state === "off") {
    inlineStyler(
      always_open,
      `{background:#26fc78; border:1px solid transparent;}`,
    );
    always_open.setAttribute("data-always-open", "on");
    await chrome.runtime.sendMessage({
      cmd: "setKeepActiveState",
      key: ComponentManager.XH_PREFIX,
      status: "on",
    });
  } else {
    inlineStyler(
      always_open,
      `{background:transparent; border:1px solid #26fc78;}`,
    );
    always_open.setAttribute("data-always-open", "off");
    await chrome.runtime.sendMessage({
      cmd: "setKeepActiveState",
      key: ComponentManager.XH_PREFIX,
      status: "off",
    });
  }
}
