import { atobJSON } from "../../../shared/manip-data/modules/encoding-decoding.js";
import { inlineStyler } from "./inline-styler.js";

export function setContainerDimensionsInWindow(elm) {
  var { cont, middle_cont } = elm;
  let wh = window.innerHeight;
  let ww = window.innerWidth;
  let main_rect = cont.getBoundingClientRect();
  let middle_rect = middle_cont.getBoundingClientRect();
  let middle_css = atobJSON(middle_cont.getAttribute("data-css"));
  if (main_rect.bottom > wh || middle_rect.bottom > wh) {
    let c_height =
      main_rect.height > 200 && main_rect.height < 500 ? main_rect.height : wh;
    let m_height =
      main_rect.height > 200 && main_rect.height < 500
        ? main_rect.height + middle_css.height
        : wh + middle_css.height;
    inlineStyler(cont, `{top:${wh - c_height}px; height:${c_height}px;}`);
    inlineStyler(middle_cont, `{height:${m_height}px;}`);
  }
  if (main_rect.right >= ww - 10 || middle_rect.right > ww - 10) {
    let c_width =
      main_rect.width > 300 && main_rect.width < 600 ? main_rect.width : ww;
    let m_width =
      main_rect.width > 300 && main_rect.height < 600
        ? main_rect.width + middle_css.width
        : ww + middle_css.width;
    inlineStyler(cont, `{left:0px; width:${c_width}px;}`);
    inlineStyler(middle_cont, `{width:${m_width}px;}`);
  }
}
