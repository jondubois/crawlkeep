import { isJsonArray } from "../../core/check/modules/is-json-array.js";

import { ComponentManager } from "./component-manager.js";

// saved_searches = [
//   {
//     is_search_criterium: true,
//     name: "dummy_electronics_engg",
//     search_expression: "elec\\w+",
//     timestamp: 1735765821560,
//     type: "regex",
//   },
// ];

export default class SearchManager {
  static instance = null;
  static NAME_KEY = "name"; // search_name
  static SEARCH_EXPRESSION_KEY = "search_expression";
  static TIMESTAMP_KEY = "timestamp";
  static TYPE_KEY = "search_type";
  static IS_SEARCH_CRITERIUM_KEY = "is_search_criterium";

  constructor() {
    if (SearchManager.instance) {
      return SearchManager.instance;
    }

    this.latest_saved_search = {};
    this.saved_searches = [];
    this.search_criteria = [];

    SearchManager.instance = this;
  }

  static getInstance = () => {
    if (!SearchManager.instance) {
      SearchManager.instance = new SearchManager();
    }
    return SearchManager.instance;
  };

  // async fetchSelectedTaxoCriteria() {
  //   const response = await chrome.runtime.sendMessage({
  //     cmd: "getAllSelectedTaxoCriteria",
  //     key: ComponentManager.XH_PREFIX,
  //   });
  //   this.search_criteria =
  //     Array.isArray(response) && isJsonArray(response)
  //       ? response
  //       : this.search_criteria;
  //   return this.search_criteria;
  // }

  init = async () => {
    await this.fetchSavedSearches();
    this.getLatestSavedSearch();
    this.getSearchCriteria();
  };

  fetchSavedSearches = async () => {
    const response = await chrome.runtime.sendMessage({
      cmd: "getAllSavedSearches",
      prefix: ComponentManager.XH_PREFIX,
    }); // TODO - replace with ComponentManager.SAVED_SEARCH_VIEWER_PREFIX
    this.latest_saved_search = this.getLatestSavedSearch();
    this.saved_searches =
      Array.isArray(response) && isJsonArray(response)
        ? response
        : this.saved_searches;
    return this.saved_searches;
  };

  getLatestSavedSearch = () => {
    const latest_search_i = this.saved_searches.findIndex(
      (rec) =>
        rec &&
        rec.timestamp ===
          Math.max(...this.saved_searches.map((r) => r.timestamp)),
    );
    this.latest_saved_search =
      latest_search_i !== -1
        ? this.saved_searches[latest_search_i]
        : this.latest_saved_search;
    return this.latest_saved_search;
  };

  getSearchCriteria = () => {
    const saved_searches = this.saved_searches;
    this.search_criteria = saved_searches.filter(
      (search) => search[SearchManager.IS_SEARCH_CRITERIUM_KEY],
    );
    return this.search_criteria;
  };

  setSearchCriteria = (value) => {
    this.search_criteria = value;
  };

  setSavedSearches = (value) => {
    this.saved_searches = value;
    this.getLatestSavedSearch();
    this.getSearchCriteria();
  };
}
