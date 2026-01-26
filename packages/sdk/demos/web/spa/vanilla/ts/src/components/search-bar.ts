/**
 * Search bar component with debounced input.
 */

export interface SearchBarOptions {
  placeholder?: string;
  debounceMs?: number;
  onSearch: (query: string) => void | Promise<void>;
}

/**
 * Create a debounced function that delays invoking the provided function.
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Render a search bar with debounced input.
 */
export function renderSearchBar(
  container: HTMLElement,
  options: SearchBarOptions
): { getValue: () => string; setValue: (value: string) => void; focus: () => void } {
  const { placeholder = "Search...", debounceMs = 300, onSearch } = options;

  container.innerHTML = `
    <div class="search-bar">
      <input
        type="search"
        id="search-input"
        placeholder="${placeholder}"
        aria-label="Search"
      />
      <button type="button" class="search-clear secondary outline" aria-label="Clear search" style="display: none;">
        ✕
      </button>
    </div>
  `;

  const input = container.querySelector("#search-input") as HTMLInputElement;
  const clearBtn = container.querySelector(".search-clear") as HTMLButtonElement;

  const debouncedSearch = debounce((query: string) => {
    onSearch(query);
  }, debounceMs);

  // Update clear button visibility
  function updateClearButton(): void {
    clearBtn.style.display = input.value.length > 0 ? "inline-block" : "none";
  }

  // Handle input changes
  input.addEventListener("input", () => {
    updateClearButton();
    debouncedSearch(input.value.trim());
  });

  // Handle clear button click
  clearBtn.addEventListener("click", () => {
    input.value = "";
    updateClearButton();
    onSearch("");
    input.focus();
  });

  // Handle Enter key for immediate search
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(input.value.trim());
    }
  });

  return {
    getValue: () => input.value.trim(),
    setValue: (value: string) => {
      input.value = value;
      updateClearButton();
    },
    focus: () => input.focus(),
  };
}
