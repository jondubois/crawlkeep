/**
 * ModalManager pattern, ensures only one modal is open at a time,
 * yet, conversely to Singleton pattern, allows multiple modal types/instances to be created.
 * Multiple modals can be created (e.g., company card, employee card, etc.), but only one is visible at once.
 * Only one modal can be open at a time: the currently registered instance.
 * Registration (ModalManager.open(this)) occurs in methods that display the modal (e.g. showModal, populateModalWithSelectedRecord, etc).
 * ModalManager closes any currently open modal before allowing a new one.
 */
export class ModalManager {
  static #OVERLAY_ID = "card-overlay";
  static #CLOSE_BUTTON_ID = "close-card";
  static currentModal = null;

  static get overlayId() {
    return this.#OVERLAY_ID;
  }

  static get closeButtonId() {
    return this.#CLOSE_BUTTON_ID;
  }

  static open(modalInstance) {
    if (
      ModalManager.currentModal &&
      ModalManager.currentModal !== modalInstance
    ) {
      ModalManager.currentModal.closeModal();
    }
    ModalManager.currentModal = modalInstance;
  }

  static close(modalInstance) {
    if (ModalManager.currentModal === modalInstance) {
      ModalManager.currentModal = null;
    }
  }

  constructor(config) {
    const {
      cards,
      options,
      templateId,
      updateCardContent,
      dataTableSelector,
      dataRowSelector,
    } = config;

    this.cards = cards;
    this.options = options;
    this.templateId = templateId;
    this.modalInstanceId = "";
    this.updateCardContent = updateCardContent;
    this.dataTableSelector = dataTableSelector;
    this.dataRowSelector = dataRowSelector;
    this.currentIndex = 0;
    this.attachEventHandlers();
  }

  // Create overlay and render template
  createModal = () => {
    const template = document.getElementById(this.templateId);
    if (template instanceof HTMLTemplateElement) {
      // Remove existing overlay to prevent duplicates
      document.getElementById(ModalManager.overlayId)?.remove();
      let overlay = document.getElementById(ModalManager.overlayId);
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.setAttribute("id", ModalManager.overlayId);
        overlay.style.zIndex = String(Date.now() - 1000);
        document.body.appendChild(overlay);
      }

      // Render template into DOM element
      const documentFragment = template.content.cloneNode(true);
      const modal = documentFragment.firstElementChild;
      if (modal) {
        this.modalInstanceId = `${this.templateId}-instance`;
        // Only change the id if it's not a navigation button we want to preserve
        if (!modal.id || !modal.id.includes("arrow-")) {
          modal.setAttribute("id", this.modalInstanceId);
        } else {
          // For arrow buttons, find the next suitable element or create a wrapper
          const nextElement = modal.nextElementSibling;
          if (nextElement && nextElement.tagName === "ARTICLE") {
            nextElement.setAttribute("id", this.modalInstanceId);
          } else {
            // Add the instance id as a data attribute to track the modal
            modal.setAttribute("data-modal-instance", this.modalInstanceId);
          }
        }
      }
      overlay.appendChild(documentFragment);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    } else {
      console.error(`Element with id '${this.templateId}' is not a template.`);
    }
  };

  attachEventHandlers = () => {
    // Close button
    document.addEventListener("click", (e) => {
      if (
        e.target.id === ModalManager.closeButtonId ||
        e.target.closest(`#${ModalManager.closeButtonId}`)
      ) {
        const overlay = document.getElementById(ModalManager.overlayId);
        if (overlay) {
          overlay.remove();
          document.body.style.overflow = "";
          ModalManager.close(this);
        }
      }
    });

    // Click outside modal
    document.addEventListener("click", (e) => {
      const overlay = document.getElementById(ModalManager.overlayId);
      if (!overlay) return;
      if (e.target.id === ModalManager.overlayId) {
        overlay.remove();
        document.body.style.overflow = "";
        ModalManager.close(this);
      }
    });

    // Pagination buttons
    document.addEventListener("click", (e) => {
      const overlay = document.getElementById(ModalManager.overlayId);
      if (!overlay) return;

      if (e.target.id === "arrow-right" || e.target.closest("#arrow-right")) {
        e.preventDefault();
        this.currentIndex = (this.currentIndex + 1) % this.cards.length;
        this.updateCardContent(this.cards[this.currentIndex], this.options);
      }

      if (e.target.id === "arrow-left" || e.target.closest("#arrow-left")) {
        e.preventDefault();
        this.currentIndex =
          (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.updateCardContent(this.cards[this.currentIndex], this.options);
      }
    });
  };

  showModal(rowIndex = 0) {
    // Ensure modal is registered and exists; close any existing
    ModalManager.open(this);
    if (!document.getElementById(this.modalInstanceId)) {
      this.createModal();
    }
    const employeeTable = document.querySelector(this.dataTableSelector);
    const rows = employeeTable.querySelectorAll("tbody tr");
    const recordRow = rows[rowIndex];

    if (recordRow) {
      const clickableElement =
        recordRow.querySelector(this.dataRowSelector) ||
        recordRow.querySelector("a") ||
        recordRow;
      this.populateModalWithSelectedRecord(clickableElement);
    } else {
      console.warn(`Could not find employee row at index ${rowIndex}`);
    }

    // Show the modal overlay
    if (this.modalInstanceId) {
      let modalDiv = document.getElementById(this.modalInstanceId);
      if (!modalDiv) {
        // Try to find element with data-modal-instance attribute
        modalDiv = document.querySelector(
          `[data-modal-instance="${this.modalInstanceId}"]`,
        );
      }
      if (modalDiv) {
        modalDiv.classList.remove("max-h-0");
        modalDiv.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  populateModalWithDefaultRecord = () => {
    ModalManager.open(this);
    if (!document.getElementById(this.modalInstanceId)) {
      this.createModal();
    }
    this.currentIndex = 0;
    const defaultCard = this.cards[0];
    if (defaultCard) {
      this.updateCardContent(defaultCard, this.options);
    } else {
      console.warn("No company cards available to display as default.");
    }
  };

  populateModalWithSelectedRecord = (clickedLink) => {
    ModalManager.open(this);
    if (!document.getElementById(this.modalInstanceId)) {
      this.createModal();
    }
    const row = clickedLink.closest("tr");
    const table = clickedLink.closest("table");
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const rowIndex = rows.indexOf(row);

    this.currentIndex = rowIndex;

    const selectedCard = this.cards[rowIndex];
    if (selectedCard) {
      this.updateCardContent(selectedCard, this.options);
    } else {
      console.warn(`Card data not found at index: ${rowIndex}`);
    }
  };

  closeModal() {
    const closeButton = document.getElementById(ModalManager.closeButtonId);
    if (closeButton) {
      closeButton.click();
    } else {
      const overlay = document.getElementById(ModalManager.overlayId);
      if (overlay) {
        overlay.click();
      }
    }
    // Optionally collapse the modal
    let modalDiv = document.getElementById(`${this.templateId}-instance`);
    if (!modalDiv) {
      // Try to find element with data-modal-instance attribute
      modalDiv = document.querySelector(
        `[data-modal-instance="${this.templateId}-instance"]`,
      );
    }
    if (modalDiv) {
      modalDiv.classList.add("max-h-0");
    }
    ModalManager.close(this);
  }
}
