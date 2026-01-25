/**
 * Toast notification component.
 */

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const DEFAULT_DURATION = 5000;

/**
 * Show a toast notification.
 */
export function showToast(options: ToastOptions): void {
  const { message, type = "info", duration = DEFAULT_DURATION } = options;

  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = "toast-out 0.3s ease-out forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

/**
 * Show a success toast.
 */
export function showSuccess(message: string): void {
  showToast({ message, type: "success" });
}

/**
 * Show an error toast.
 */
export function showError(message: string): void {
  showToast({ message, type: "error" });
}

/**
 * Show an info toast.
 */
export function showInfo(message: string): void {
  showToast({ message, type: "info" });
}
