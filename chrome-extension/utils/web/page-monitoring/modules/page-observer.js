import { delay } from "./delay.js";

/**
 * @description monitors changes to the URL of the current page every second or on scroll
 * Logs to the console if the URL has changed.
 */
export async function pageObserver() {
  var current_url = window.location.href;
  async function checkUrlState() {
    await delay(111);
    if (current_url !== window.location.href) {
      console.log("current_url !== window.location.href");
      await delay(1111);
      current_url = window.location.href;
    }
  }
  window.addEventListener("scroll", checkUrlState);
}
