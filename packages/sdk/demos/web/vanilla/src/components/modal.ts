/**
 * Modal dialog component.
 */

interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancel?: boolean;
}

let activeModal: HTMLDialogElement | null = null;

/**
 * Show a modal dialog.
 */
export function showModal(options: ModalOptions): HTMLDialogElement {
  const {
    title,
    content,
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    showCancel = true,
  } = options;

  // Close any existing modal
  closeModal();

  const dialog = document.createElement("dialog");
  dialog.innerHTML = `
    <article>
      <header>
        <button aria-label="Close" rel="prev" class="modal-close"></button>
        <h3>${title}</h3>
      </header>
      <div class="modal-content"></div>
      <footer>
        ${showCancel ? `<button class="secondary modal-cancel">${cancelText}</button>` : ""}
        <button class="modal-confirm">${confirmText}</button>
      </footer>
    </article>
  `;

  // Set content
  const contentContainer = dialog.querySelector(".modal-content") as HTMLElement;
  if (typeof content === "string") {
    contentContainer.innerHTML = content;
  } else {
    contentContainer.appendChild(content);
  }

  // Attach event listeners
  const closeBtn = dialog.querySelector(".modal-close");
  const cancelBtn = dialog.querySelector(".modal-cancel");
  const confirmBtn = dialog.querySelector(".modal-confirm");

  closeBtn?.addEventListener("click", () => {
    onCancel?.();
    closeModal();
  });

  cancelBtn?.addEventListener("click", () => {
    onCancel?.();
    closeModal();
  });

  confirmBtn?.addEventListener("click", async () => {
    if (onConfirm) {
      confirmBtn.setAttribute("aria-busy", "true");
      try {
        await onConfirm();
        closeModal();
      } catch (error) {
        console.error("Modal confirm error:", error);
      } finally {
        confirmBtn.removeAttribute("aria-busy");
      }
    } else {
      closeModal();
    }
  });

  // Close on backdrop click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      onCancel?.();
      closeModal();
    }
  });

  // Close on Escape key
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      onCancel?.();
      closeModal();
    }
  });

  document.body.appendChild(dialog);
  dialog.showModal();
  activeModal = dialog;

  return dialog;
}

/**
 * Close the active modal.
 */
export function closeModal(): void {
  if (activeModal) {
    activeModal.close();
    activeModal.remove();
    activeModal = null;
  }
}

/**
 * Show a confirmation dialog.
 */
export function confirm(
  title: string,
  message: string,
  options?: Partial<ModalOptions>
): Promise<boolean> {
  return new Promise((resolve) => {
    showModal({
      title,
      content: `<p>${message}</p>`,
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      showCancel: true,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      ...options,
    });
  });
}

/**
 * Show an alert dialog.
 */
export function alert(title: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    showModal({
      title,
      content: `<p>${message}</p>`,
      confirmText: "OK",
      showCancel: false,
      onConfirm: () => resolve(),
    });
  });
}
