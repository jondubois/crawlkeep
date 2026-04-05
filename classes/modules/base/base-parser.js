/**
 * @todo - spread `node_label`, `edge_from`, `edge_to` to the codebase
 */
export class BaseParser {
  #child_entries_key = "child_entries";
  #cat_prop = "name"; // TODO - rename to `cat_name_key`
  #node_name_key = "node_name";
  #node_id_key = "node_id";
  // #node_label = "node_label"; TODO - spread `node_label`, `edge_from`, `edge_to` to the codebase
  // #edge_from = "from";
  // #edge_to = "to";

  get child_entries_key() {
    return this.#child_entries_key;
  }

  get node_name_key() {
    return this.#node_name_key;
  }
  // set node_name_key(value) {
  //   if (typeof value !== "string") {
  //     throw new TypeError(
  //       `${
  //         this.constructor.name
  //       }.node_name_key - Invalid input. Expected ${value} to be a String. Instead, got ${typeof value}`,
  //     );
  //   }
  //   if (!value) {
  //     throw new Error(
  //       `${this.constructor.name}.node_name_key - The property key must be provided.`,
  //     );
  //   }
  //   this.#node_name_key = value;
  // }

  get node_id_key() {
    return this.#node_id_key;
  }
  // set node_id_key(value) {
  //   if (typeof value !== "string") {
  //     throw new TypeError(
  //       `${
  //         this.constructor.name
  //       }.node_id_key - Invalid input. Expected ${value} to be a String. Instead, got ${typeof value}`,
  //     );
  //   }
  //   if (!value) {
  //     throw new Error(
  //       `${this.constructor.name}.node_id_key - The property key must be provided.`,
  //     );
  //   }
  //   this.#node_id_key = value;
  // }

  get cat_prop() {
    return this.#cat_prop;
  }
}
