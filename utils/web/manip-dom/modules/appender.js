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
    } catch (error) {
      console.error(
        `Whilst processing appender(), Error: ${error.message}`,
        error,
      );

      // Fallback: Append to document body
      try {
        document.body.appendChild(cont);
        console.warn(`${appender.name} - Fallback: appended to document body`);
      } catch (fallbackError) {
        console.error(
          `Fallback failed in appender(): ${fallbackError.message}`,
          fallbackError,
        );
      }
    }
  } else {
    // If no parent element is provided, append to document body
    try {
      document.body.appendChild(cont);
      console.log(`${appender.name} - appended to document body`);
    } catch (error) {
      console.error(
        `Failed to append to document body in appender(): ${error.message}`,
        error,
      );
    }
  }
}
