import { buildRectangleOverlay, getBoundaries } from "./utils/index.js";

// Crawling Animation
const SAMPLE_LI_URLS = [
  "https://www.sentinelone.com/",
  "https://linkedin.com/company/crowdstrike",
  "https://www.paloaltonetworks.com/",
  "https://linkedin.com/company/akto",
  "https://www.bitdefender.com/en-au/",
];
const crawlMessage = document.getElementById("crawl-message");
const urlList = document.getElementById("url-list");

const animation = {
  showCircling: ({ target, areaSelection, color, duration }) => {
    const rects = getBoundaries(target, areaSelection);
    const overlay = buildRectangleOverlay(rects, color);
    if (!overlay) return;
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, duration);
  },
  triggerClick: ({ target }) => {
    if (target) {
      target.click();
    }
  },
  typeChar: (i, text, textarea) => {
    if (i <= text.length) {
      textarea.value = text.slice(0, i);
      i++;
      setTimeout(() => animation.typeChar(i, text, textarea), 35); // Typing speed in ms
    } else {
      textarea.disabled = false;
      textarea.focus();
    }
  },
};

document.getElementById("job-prompt").addEventListener("click", function () {
  this.value = "";
  this.disabled = true;
  const textToType =
    "A Lead Data Scientist role where I can be collaborating with cross-functional teams on an Agentic AI product";

  animation.typeChar(0, textToType, this);
});

document
  .getElementById("company-prompt")
  .addEventListener("click", function () {
    this.value = "";
    this.disabled = true;
    const textToType =
      "A fast-paced series-B and above scaleup with approximately 150 to 300 employees, in the Cybersecurity space with a strong focus on Data Science, and a flexible remote work policy";

    animation.typeChar(0, textToType, this);
  });

document.getElementById("crawl-btn").addEventListener("click", () => {
  crawlMessage.classList.toggle("hidden");
  crawlMessage.classList.toggle("opacity-0");
  crawlMessage.classList.toggle("opacity-100");

  setTimeout(() => {
    SAMPLE_LI_URLS.forEach((url, index) => {
      setTimeout(() => {
        const listItem = document.createElement("li");
        listItem.textContent = url;
        urlList.appendChild(listItem);
        document
          .getElementById("main-content")
          .scrollIntoView({ behavior: "smooth", block: "end" });

        // // Navigate to the final URL after all URLs are displayed
        // if (index === SAMPLE_LI_URLS.length - 1) {
        //   setTimeout(() => {
        //     window.location.href = "https://www.crawlkeep.com/app/#/log-in/";
        //   }, 1000);
        // }
      }, index * 1000);
    });
  }, 1000);
});

// Sequence highlighting of element
const timing = new Map([
  [0, 1000],
  [1, 4000],
  [2, 9000],
  [3, 9500],
  // [0, 3700],
  // [1, 12900],
  // [2, 20600],
  // [3, 21000],
]);
function toRelativeDelaysFromAbsolute(timingMap) {
  const steps = Array.from(timingMap.entries()).sort((a, b) => a[0] - b[0]);
  const relDelays = [];
  let prev = 0;
  for (let i = 0; i < steps.length; i++) {
    const [idx, abs] = steps[i];
    relDelays[idx] = Number(abs) - prev;
    prev = abs;
  }
  return relDelays;
}
const relativeDelays = toRelativeDelaysFromAbsolute(timing);

function playAnimation(i = 0) {
  let id = "";
  let duration = 1000;
  let overlayId = "";
  let actionName = "";
  let areaSelection = {};
  let color = {};

  switch (i) {
    case 0:
      id = "company-prompt";
      actionName = "triggerClick";
      console.log(
        "type ideal company description",
        (performance.now() / 1000).toFixed(2),
      );
      break;
    case 1:
      id = "job-prompt";
      actionName = "triggerClick";
      console.log(
        "type ideal job description",
        (performance.now() / 1000).toFixed(2),
      );
      break;
    case 2:
      id = "crawl-btn";
      console.log(
        "highlight crawl button",
        (performance.now() / 1000).toFixed(2),
      );
      break;
    case 3:
      id = "crawl-btn";
      actionName = "triggerClick";
      console.log(
        "launch crawling animation",
        (performance.now() / 1000).toFixed(2),
      );
      break;

    default:
      return;
  }

  id = id || `sequence-${i}`;
  actionName = actionName || "showCircling";
  const target = document.getElementById(id);

  // Run animation
  animation[actionName]({
    target,
    areaSelection,
    color,
    duration,
    overlayId,
  });

  // Schedule next step
  const delay = relativeDelays[i + 1] || 1200;
  // const delay = Number(timing.get(i)) || 1200;
  setTimeout(() => playAnimation(i + 1), delay);
}

// Start the animation sequence automatically after DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => playAnimation(0), relativeDelays[0] || 0);
});
