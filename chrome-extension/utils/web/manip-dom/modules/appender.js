export function appender(params) {
  var { cont, parent_elm, attach_method, ref_elm } = params;
  if (parent_elm) {
    try {
      if (attach_method) {
        parent_elm[attach_method](cont, ref_elm);
      } else {
        parent_elm.appendChild(cont);
        console.log(`${appender.name} - appended to parent elm`);
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    document.body.appendChild(cont);
    console.log(`${appender.name} - appended to document body`);
  }
}
