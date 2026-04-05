import { buildCompanyViewer } from "../../helper/modules/build-company-viewer.js";

export async function initAdvancedHighlighterHTML() {
  // add user-defined methods to the `Element` prototype
  Element.prototype.documentOffsetTop = () =>
    this.offsetTop +
    (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
  Element.prototype.visible = function () {
    return (
      !window.getComputedStyle(this) ||
      window.getComputedStyle(this).getPropertyValue("display") === "" ||
      window.getComputedStyle(this).getPropertyValue("display") !== "none"
    );
  };

  const parts_of_cpy_viewer = await buildCompanyViewer();

  // insert `parts_of_cpy_viewer.root_cont` at the top of `body`
  document.body.insertBefore(
    parts_of_cpy_viewer.root_cont,
    document.body.firstChild,
  );
}
