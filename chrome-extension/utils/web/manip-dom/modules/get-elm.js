export const cn = (o, s) => (o ? o.getElementsByClassName(s) : null); // return live HTMLCollections, which are different from the static NodeList returned by querySelectorAll
export const tn = (o, s) => (o ? o.getElementsByTagName(s) : null);
export const gi = (id_str) => document.getElementById(id_str);
export const ge = (param) => {
  const { scope, id, class_name, tag } = param;
  const o = scope ? scope : document;
  const class_selector = Array.isArray(class_name)
    ? class_name.join(".")
    : class_name;
  switch (true) {
    case !!(id && class_name && tag):
      return o.querySelector(`${tag}#${id}.${class_selector}`);
    case !!(id && class_name && !tag):
      return o.querySelector(`#${id}.${class_selector}`);
    case !!(id && !class_name && tag):
      return o.querySelector(`${tag}#${id}`);
    case !!(!id && class_name && tag):
      return o.querySelector(`${tag}.${class_selector}`);
    case !!(id && !class_name && !tag):
      return o.querySelector(`#${id}`);
    case !!(!id && class_name && !tag):
      return o.querySelector(`.${class_selector}`);
    case !!(!id && !class_name && tag):
      return o.querySelector(tag);
    default:
      return null;
  }
};

export const ges = (param) => {
  const { scope, id, class_name, tag } = param;
  let o = scope ? scope : document;
  const class_selector = Array.isArray(class_name)
    ? class_name.join(".")
    : class_name;
  switch (true) {
    case !!(id && class_name && tag):
      return o.querySelectorAll(`${tag}#${id}.${class_selector}`);
    case !!(id && class_name && !tag):
      return o.querySelectorAll(`#${id}.${class_selector}`);
    case !!(id && !class_name && tag):
      return o.querySelectorAll(`${tag}#${id}`);
    case !!(!id && class_name && tag):
      return o.querySelectorAll(`${tag}.${class_selector}`);
    case !!(id && !class_name && !tag):
      return o.querySelectorAll(`#${id}`);
    case !!(!id && class_name && !tag):
      return o.querySelectorAll(`.${class_selector}`);
    case !!(!id && !class_name && tag):
      return o.querySelectorAll(tag);
    default:
      return null;
  }
};
/* `getElementById()` is only available as a method of the global document object,
and not on all element objects in the DOM (https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById#example) */
