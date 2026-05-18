/**
 * Loading state components.
 */

/**
 * Render a loading spinner.
 */
export function renderLoading(container: HTMLElement, message = 'Loading...'): void {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner large"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Render an inline loading spinner.
 */
export function renderInlineLoading(): string {
  return '<span class="loading-spinner"></span>';
}

/**
 * Render a skeleton loading state for a table.
 */
export function renderTableSkeleton(columns: number, rows = 5): string {
  const headerCells = Array(columns)
    .fill('<th><div class="skeleton" style="height: 1rem; width: 80%;"></div></th>')
    .join('');

  const rowCells = Array(columns)
    .fill('<td><div class="skeleton" style="height: 1rem; width: 60%;"></div></td>')
    .join('');

  const bodyRows = Array(rows).fill(`<tr>${rowCells}</tr>`).join('');

  return `
    <table>
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;
}

/**
 * Render an empty state.
 */
export function renderEmptyState(
  container: HTMLElement,
  title: string,
  message?: string,
  actionHtml?: string
): void {
  container.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      ${message ? `<p>${message}</p>` : ''}
      ${actionHtml || ''}
    </div>
  `;
}

/**
 * Render an error state.
 */
export function renderError(
  container: HTMLElement,
  title: string,
  message: string,
  retryAction?: () => void
): void {
  container.innerHTML = `
    <article>
      <header>
        <h3>${title}</h3>
      </header>
      <p>${message}</p>
      ${retryAction ? '<button id="retry-btn">Retry</button>' : ''}
    </article>
  `;

  if (retryAction) {
    container.querySelector('#retry-btn')?.addEventListener('click', retryAction);
  }
}
