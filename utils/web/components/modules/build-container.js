import { main_app_colors, svgs } from "../../color-palette.js";
import { btoaJSON } from "../../manip-data/modules/encoding-decoding.js";
import {
  a,
  gi,
  appender,
  inlineStyler,
  topZIndexer,
  dragElement,
  adjustElementSize,
} from "../../manip-dom/index.js";
import { buildPart } from "./build-part.js";
import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

/**
 * @description Builds a container element.
 * @returns {Object} - An object containing references to web HTML elements within the container.
 * @todo - .draggable (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable)
 */
export function buildContainer(config) {
  let {
    application_label,
    background,
    background_color,
    border_px,
    close_action,
    close_btn_px,
    container_id,
    font_family,
    font_size_px,
    footer_height_px,
    forced_left,
    forced_top,
    gradient_bg,
    header_height_px,
    left,
    left_panel_width_px,
    moveable_head,
    movable_footer,
    movable_left,
    movable_right,
    open_action,
    parent_elm,
    ref_elm,
    resizeable,
    right_panel_width_px,
    shadow,
    shift_col_px,
    text,
    top,
  } = config;

  // singleton
  gi(container_id)?.remove();

  // position the container relative to the reference element
  if (ref_elm instanceof Element) {
    const ref_elm_rect = ref_elm.getBoundingClientRect();
    top = ref_elm_rect.top ?? top;
    left = ref_elm_rect.left + ref_elm_rect.width ?? left;
  }

  // if(open_action) open_action();
  const ref_rect = ref_elm?.getBoundingClientRect();

  const root_cont = buildPart(comp_mngr.template.root_cont.name); // document.createElement("div");
  appender({ ...config, ...{ cont: root_cont } });
  root_cont.setAttribute(
    "id",
    container_id ??
      comp_mngr.setId(
        comp_mngr.template.root_cont.name,
        comp_mngr.TEMPLATE_PREFIX,
      ),
  ); // for uniqueness, has to overwrite any pre-existing ID
  // a(root_cont, [["class", `${generateClassName(template_names_of_parts.root_cont)}`]]);
  inlineStyler(
    root_cont,
    `{display: grid; grid-template-columns: ${
      left_panel_width_px || 32
    }px 1fr ${right_panel_width_px || 32}px; box-shadow: ${
      shadow || main_app_colors.shadow
    }; text-align: left; background: ${
      gradient_bg || background_color || main_app_colors.bg_color
    }; color: ${text || main_app_colors.text}; border: ${
      border_px || 1.3
    }px solid ${main_app_colors.border};
    z-index: ${topZIndexer()}; position: fixed; top: ${
      forced_top || ref_rect?.top || top || 1
    }px; left: ${forced_left || ref_rect?.left || left || 1}px;}`,
  );

  // left side
  const left_side = buildPart(comp_mngr.template.left_side.name);
  root_cont.appendChild(left_side);
  inlineStyler(
    left_side,
    `{height:100%; display:grid; grid-template-rows: ${
      header_height_px || 32
    }px 1fr ${footer_height_px || 32}px; }`,
  );

  const cls_btn = buildPart(comp_mngr.template.cls_btn.name);
  left_side.appendChild(cls_btn);
  cls_btn.innerHTML = svgs.close
    ?.replace(/(?<=width\:\s+)\d+/, close_btn_px || shift_col_px)
    ?.replace(/(?<=height\:\s+)\d+/, close_btn_px || shift_col_px);
  cls_btn.classList.add("hover-btn", "overflow-clip");
  // a(cls_btn, [
  //   ["class", "hover-btn overflow-clip"],
  //   ["data-container-id", container_id], // user-defined attribute aka custom data attribute prefixed with `data-`. TODO - not used and referencing the wrong container ID
  // ]);
  inlineStyler(
    cls_btn,
    `{background-color:${
      main_app_colors.body_bg
    }; transform:translate(2px,2px); cursor: pointer; min-width: ${
      close_btn_px || shift_col_px || 32
    }px; min-height: ${close_btn_px || shift_col_px || 32}px;}`,
  );
  cls_btn.addEventListener("click", close_action || (() => root_cont.remove()));

  const left_dragger = buildPart(comp_mngr.template.left_dragger.name);
  left_side.appendChild(left_dragger);
  a(left_dragger, [["data-move-id", container_id]]);
  left_dragger.classList.add("drag_actor", "drag_actor_left");
  inlineStyler(
    left_dragger,
    `{min-height:10px; ${movable_left ? "cursor: move;" : ""}}`,
  );
  if (movable_left) {
    left_dragger.addEventListener("mousedown", (event) => dragElement(event));
  }

  // inside of the container
  const middle_cont = buildPart(comp_mngr.template.middle_cont.name);
  root_cont.appendChild(middle_cont);

  const header = buildPart(comp_mngr.template.header.name);
  middle_cont.appendChild(header);
  a(header, [["data-move-id", container_id]]);
  header.classList.add("drag_actor", "drag_actor_head");
  inlineStyler(
    header,
    `{min-height: ${header_height_px || 32}px; user-select: none;${
      moveable_head ? "cursor: move;" : ""
    }}`,
  );
  if (moveable_head) {
    header.addEventListener("mousedown", (event) => dragElement(event));
  }

  const head_mover = buildPart(comp_mngr.template.head_mover.name);
  header.appendChild(head_mover);
  a(head_mover, [["data-move-id", container_id]]); // custom attribute `data-` used to stored the latest position to local storage

  const top_label = buildPart(comp_mngr.template.top_label.name);
  header.appendChild(top_label);
  top_label.innerHTML = application_label || "";
  inlineStyler(top_label, "{text-align: left;}");

  const menu_body = buildPart(comp_mngr.template.menu_body.name);
  middle_cont.appendChild(menu_body);
  inlineStyler(
    menu_body,
    `{
    min-height:10px; max-height:${
      document.body.getBoundingClientRect().height -
      (header_height_px + footer_height_px)
    }px;
    }`,
  );

  const footer = buildPart(comp_mngr.template.footer.name);
  middle_cont.appendChild(footer);
  a(footer, [["data-move-id", container_id]]);
  inlineStyler(
    footer,
    `{height:${footer_height_px}px; user-select: none; ${
      movable_footer ? "cursor: move;" : ""
    }}`,
  );
  if (movable_footer) {
    footer.addEventListener("mousedown", (event) => dragElement(event));
  }

  // right side
  const right_side = buildPart(comp_mngr.template.right_side.name);
  root_cont.appendChild(right_side);
  inlineStyler(
    right_side,
    `{height:100%; display:grid; grid-template-rows: ${
      header_height_px || 32
    }px 1fr ${footer_height_px || 32}px; }`,
  );

  const right_top_btn = buildPart(comp_mngr.template.right_top_btn.name);
  right_side.appendChild(right_top_btn);
  inlineStyler(
    right_top_btn,
    `{cursor: pointer; width: ${shift_col_px || 32}px; height: ${
      shift_col_px || 32
    }px;}`,
  );

  const right_dragger = buildPart(comp_mngr.template.right_dragger.name);
  right_side.appendChild(right_dragger);
  a(right_dragger, [["data-move-id", container_id]]);
  right_dragger.classList.add("drag_actor", "drag_actor_right");
  inlineStyler(
    right_dragger,
    `{min-height:10px; user-select: none; ${
      movable_right ? "cursor: move;" : ""
    }}`,
  );
  if (movable_right) {
    right_dragger.addEventListener("mousedown", (event) => dragElement(event));
  }

  const foot_resizer = buildPart(comp_mngr.template.foot_resizer.name);
  right_side.appendChild(foot_resizer);
  a(foot_resizer, [
    ["data-move-id", container_id],
    ["data-resize-id", `${container_id},${comp_mngr.template.menu_body.id}`],
    [
      "data-parent-dimensions",
      btoaJSON({
        header_height_px: header_height_px,
        left_panel_width_px: left_panel_width_px,
        right_panel_width_px: right_panel_width_px,
        footer_height_px: footer_height_px,
        shift_col_px: shift_col_px,
        close_btn_px: close_btn_px,
      }),
    ],
  ]);
  inlineStyler(foot_resizer, `{${resizeable ? "cursor:nw-resize;" : ""}}`);
  if (resizeable) {
    foot_resizer.innerHTML = svgs.resize
      ?.replace(/(?<=width\:\s+)\d+/, right_panel_width_px)
      ?.replace(/(?<=height\:\s+)\d+/, footer_height_px);

    foot_resizer.addEventListener("mousedown", (event) =>
      adjustElementSize(event),
    );
    /* the web HTML element is passed implicitly, and accessed in `adjustElementSize` via `this`,
    which refers to the calling context, ie. whatever called the function `adjustElementSize`, ie. `foot_resizer`.
    A more explicit way to pass the element would be to use a closure, and pass the event object, which carries the web HTML element in its `target` property. */
  }

  Array.from(root_cont.querySelectorAll("div, a")).forEach((elm) =>
    inlineStyler(
      elm,
      `{font-family: ${font_family} ?? 'Open Sans', sans-serif; font-size:${font_size_px} ?? 12px;}`,
      `{font-family: '${font_family || "'Open Sans', sans-serif"}; font-size: ${
        font_size_px || 12
      }px;}`,
    ),
  ); // all <div> and <a>. TODO - set it in css.js

  return {
    cls_btn,
    root_cont,
    foot_resizer,
    footer,
    head_mover,
    header,
    left_dragger,
    left_side,
    menu_body,
    middle_cont,
    right_dragger,
    right_side,
    right_top_btn,
    top_label,
  };
}
