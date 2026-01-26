import type { Table } from "@tanstack/table-core";
import type { CustomerRow } from "../../state";

export function renderSortIcon(columnId: string, table: Table<CustomerRow>): string {
  const sorting = table.getState().sorting;
  const sortItem = sorting.find((s) => s.id === columnId);
  if (!sortItem) return " ↕️";
  return sortItem.desc ? " ↓" : " ↑";
}

export function renderSkeletonRows(count: number): string {
  return Array.from({ length: count }, () => `
    <tr class="border-b">
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
      <td class="p-2"><div class="h-4 w-full bg-accent animate-pulse rounded-md"></div></td>
    </tr>
  `).join("");
}

export function formatDate(dateStr: unknown): string {
  if (typeof dateStr !== "string") return "-";
  return new Date(dateStr).toLocaleDateString();
}
