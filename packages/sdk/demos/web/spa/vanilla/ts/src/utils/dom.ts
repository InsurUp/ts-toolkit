/**
 * DOM manipulation utilities.
 */

/**
 * Create an element with attributes and children.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | boolean | undefined>,
  ...children: (string | Node)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === false) continue;
      if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * Shorthand for querySelector.
 */
export function $(selector: string, parent: ParentNode = document): Element | null {
  return parent.querySelector(selector);
}

/**
 * Shorthand for querySelectorAll.
 */
export function $$(selector: string, parent: ParentNode = document): NodeListOf<Element> {
  return parent.querySelectorAll(selector);
}

/**
 * Set inner HTML safely and return the container.
 */
export function html(container: HTMLElement, content: string): HTMLElement {
  container.innerHTML = content;
  return container;
}

/**
 * Add event listener with delegation.
 */
export function delegate(
  container: HTMLElement,
  selector: string,
  event: string,
  handler: (e: Event, target: Element) => void
): () => void {
  const listener = (e: Event) => {
    const target = (e.target as Element).closest(selector);
    if (target && container.contains(target)) {
      handler(e, target);
    }
  };

  container.addEventListener(event, listener);

  return () => container.removeEventListener(event, listener);
}

/**
 * Wait for an element to exist in the DOM.
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Escape HTML to prevent XSS.
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
