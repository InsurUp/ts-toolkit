/**
 * Column visibility component with localStorage persistence.
 */

export interface ColumnConfig {
  id: string;
  label: string;
  defaultVisible?: boolean;
}

export interface ColumnVisibilityOptions {
  columns: ColumnConfig[];
  storageKey?: string;
  onChange?: (visibleColumns: Set<string>) => void;
}

/**
 * Load visible columns from localStorage or use defaults.
 */
function loadVisibleColumns(columns: ColumnConfig[], storageKey?: string): Set<string> {
  if (storageKey) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Use defaults
  return new Set(
    columns.filter((col) => col.defaultVisible !== false).map((col) => col.id)
  );
}

/**
 * Save visible columns to localStorage.
 */
function saveVisibleColumns(visibleColumns: Set<string>, storageKey?: string): void {
  if (storageKey) {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...visibleColumns]));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Render a column visibility dropdown.
 */
export function renderColumnVisibility(
  container: HTMLElement,
  options: ColumnVisibilityOptions
): { getVisibleColumns: () => Set<string>; setVisibleColumns: (columns: Set<string>) => void } {
  const { columns, storageKey, onChange } = options;

  let visibleColumns = loadVisibleColumns(columns, storageKey);

  function render(): void {
    const checkboxesHtml = columns
      .map(
        (col) => `
        <label class="column-checkbox">
          <input type="checkbox" data-column-id="${col.id}" ${visibleColumns.has(col.id) ? "checked" : ""} />
          ${col.label}
        </label>
      `
      )
      .join("");

    container.innerHTML = `
      <div class="column-visibility">
        <button type="button" class="secondary outline column-visibility-toggle" aria-expanded="false">
          Columns ▾
        </button>
        <div class="column-visibility-dropdown" style="display: none;">
          <div class="column-visibility-header">
            <span>Show/Hide Columns</span>
            <button type="button" class="column-visibility-reset secondary outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
              Reset
            </button>
          </div>
          <div class="column-visibility-list">
            ${checkboxesHtml}
          </div>
        </div>
      </div>
    `;

    // Toggle dropdown
    const toggleBtn = container.querySelector(".column-visibility-toggle") as HTMLButtonElement;
    const dropdown = container.querySelector(".column-visibility-dropdown") as HTMLElement;

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display !== "none";
      dropdown.style.display = isOpen ? "none" : "block";
      toggleBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target as Node)) {
        dropdown.style.display = "none";
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Handle checkbox changes
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const input = checkbox as HTMLInputElement;
        const columnId = input.dataset.columnId!;

        if (input.checked) {
          visibleColumns.add(columnId);
        } else {
          // Prevent hiding all columns
          if (visibleColumns.size > 1) {
            visibleColumns.delete(columnId);
          } else {
            input.checked = true;
            return;
          }
        }

        saveVisibleColumns(visibleColumns, storageKey);
        onChange?.(visibleColumns);
      });
    });

    // Reset button
    const resetBtn = container.querySelector(".column-visibility-reset") as HTMLButtonElement;
    resetBtn.addEventListener("click", () => {
      visibleColumns = new Set(
        columns.filter((col) => col.defaultVisible !== false).map((col) => col.id)
      );
      saveVisibleColumns(visibleColumns, storageKey);
      render();
      onChange?.(visibleColumns);
    });
  }

  render();

  return {
    getVisibleColumns: () => new Set(visibleColumns),
    setVisibleColumns: (newColumns: Set<string>) => {
      visibleColumns = new Set(newColumns);
      saveVisibleColumns(visibleColumns, storageKey);
      render();
    },
  };
}
