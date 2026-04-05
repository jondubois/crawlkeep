import {
  scaleCircleForResponsiveness,
  buildRectangleOverlay,
  buildSVGCircle,
  buildSVGOverlayOn,
  getBoundaries,
} from "../utils/index.js";

export class AnimationManager {
  static #actions = {
    addClass: ({ target, parameter }) => {
      if (target && parameter?.className) {
        target.classList.add(parameter.className);
      }
    },
    displayElm: ({ target, parameter }) => {
      const isHidden = !parameter?.isDisplayed;
      // console.log(
      //   "displayElm called with isHidden:",
      //   isHidden,
      //   "target:",
      //   target,
      // );

      target.classList.toggle("hidden", isHidden);
    },
    drawCircleOnImage: ({ target, overlayId, areaSelection, classNames }) => {
      const svg =
        document.getElementById(overlayId) ||
        buildSVGOverlayOn(target, overlayId);
      if (svg instanceof SVGSVGElement) {
        const circle = buildSVGCircle(
          svg,
          scaleCircleForResponsiveness(target, areaSelection),
        );
        circle.classList.add(...classNames);
        svg.appendChild(circle);
      } else {
        console.warn(
          `drawCircleOnImage - Expected SVGSVGElement. Instead, was passed ${typeof svg}.`,
        );
      }
    },
    drawMultipleCirclesOnImage: ({
      target,
      overlayId,
      areaSelection,
      classNames,
    }) => {
      const svg =
        document.getElementById(overlayId) ||
        buildSVGOverlayOn(target, overlayId);
      if (svg instanceof SVGSVGElement) {
        areaSelection.forEach((sel) => {
          const circle = buildSVGCircle(
            svg,
            scaleCircleForResponsiveness(target, sel),
          );
          circle.classList.add(...classNames);
          svg.appendChild(circle);
        });
      } else {
        console.warn(
          `drawMultipleCirclesOnImage - Expected SVGSVGElement. Instead, was passed ${typeof svg}.`,
        );
      }
    },
    fadeElm: ({ target, parameter }) => {
      const faded = parameter?.faded || "out";
      // console.log("fadeElm called with faded:", faded, "target:", target);
      if (faded === "in") {
        target.classList.remove("fade-out");
        target.classList.add("fade-in");
      } else if (faded === "out") {
        target.classList.remove("fade-in");
        target.classList.add("fade-out");
      }
    },
    highlightElm: ({ target, areaSelection, classNames, duration }) => {
      const rects = getBoundaries(target, areaSelection);
      document
        .querySelectorAll(".dom-elm-overlay")
        .forEach((el) => el.remove());
      const overlay = buildRectangleOverlay(rects);
      overlay.classList.add(...classNames);
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, duration);
    },
    populateUrlList: ({ target, parameter }) => {
      const urls = parameter?.urls;

      if (!target || !urls) return;

      target.innerHTML = "";

      // Sequentially add each URL to the list
      urls.forEach((url, index) => {
        setTimeout(() => {
          const listItem = document.createElement("li");
          listItem.textContent = url;
          target.appendChild(listItem);
        }, index * 1000);
      });
    },
    removeClass: ({ target, parameter }) => {
      if (target && parameter?.className) {
        target.classList.remove(parameter.className);
      }
    },
    scrollElmInView: ({ target, parameter }) => {
      if (target) {
        target.scrollIntoView(parameter); // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      } else if (parameter?.alignToTop) {
        (document.documentElement || document.body).scrollIntoView(
          parameter?.alignToTop,
        ); // window.scrollTo({ top: 0, behavior: parameter?.behavior || "smooth" });
      }
    },
    setText: ({ target, parameter }) => {
      if (target && parameter?.text !== undefined) {
        target.textContent = parameter.text;
      }
    },
    showElm: ({ target, parameter }) => {
      const isHidden = parameter?.isHidden || false;
      // console.log("showElm called with isHidden:", isHidden, "target:", target);

      if (isHidden) {
        target.classList.remove("show");
        target.classList.add("hide"); // .classList.toggle(
      } else {
        target.classList.remove("hide");
        target.classList.add("show");
      }
    },
    triggerClick: ({ target }) => {
      if (target) {
        target.click();
      }
    },
    typeChar: function typeChar(i, text, textarea) {
      if (i <= text.length) {
        textarea.value = text.slice(0, i);
        i++;
        setTimeout(
          () => AnimationManager.actions.typeChar(i, text, textarea),
          35,
        ); // Typing speed in ms
      } else {
        textarea.disabled = false;
        textarea.focus();
      }
    },
  };

  static get actions() {
    return this.#actions;
  }

  static set actions(newActions) {
    // Can only add or override, not delete
    for (const [key, fn] of Object.entries(newActions)) {
      if (typeof fn === "function") {
        this.#actions[key] = fn;
      }
    }
  }

  /**
   * @param {Array} steps - Array of step objects, each with:
   *   - id: string (element id)
   *   - actionName: string (required)
   *   - absTiming: number (absolute ms)
   *   - areaSelection, duration, overlayId, log: optional
   */
  constructor(steps = []) {
    this.steps = steps;
    this.currentStep = 0;
    this.timer = null;
    this.ascendingSortedSteps = [...this.steps].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0),
    );
  }

  playAnimation(i = 0) {
    // Set execution order
    const steps = this.steps;

    if (i >= steps.length) {
      console.log(
        "Animation sequence completed",
        (performance.now() / 1000).toFixed(2),
      );
      return;
    }

    const {
      id,
      actionName = "highlightElm",
      absTiming,
      areaSelection,
      classNames,
      duration = 2000,
      overlayId,
      log,
      parameter,
    } = steps[i];

    if (!actionName) {
      console.warn(`No actionName specified for step ${i}`);
      return;
    }

    if (log) {
      console.log(log, (performance.now() / 1000).toFixed(2));
    }

    const target = document.getElementById(id);

    if (typeof AnimationManager.actions[actionName] === "function") {
      AnimationManager.actions[actionName]({
        areaSelection,
        classNames,
        duration,
        overlayId,
        target,
        parameter,
      });
    } else {
      console.warn(`Unknown action: ${actionName}`);
    }

    // Compute relative delay for next step
    let nextDelay = 1200;
    if (i + 1 < steps.length) {
      const nextAbs = steps[i + 1].absTiming || 0;
      nextDelay = nextAbs - Number(absTiming);
    }

    this.timer = setTimeout(() => this.playAnimation(i + 1), nextDelay);
  }

  start() {
    this.currentStep = 0;
    this.playAnimation(0);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
