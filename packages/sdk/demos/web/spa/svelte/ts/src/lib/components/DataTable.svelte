<script lang="ts" generics="T">
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Button,
    Skeleton,
  } from "$lib/components/ui";
  import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import type { Column, SortDirection } from "$lib/types";

  interface Props {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    sortField?: string | null;
    sortDirection?: SortDirection;
    onSort?: (field: string) => void;
    onRowClick?: (item: T) => void;
    getRowKey: (item: T) => string;
    renderCell?: Snippet<[{ item: T; column: Column<T> }]>;
  }

  let {
    columns,
    data,
    isLoading = false,
    sortField = null,
    sortDirection = null,
    onSort,
    onRowClick,
    getRowKey,
    renderCell,
  }: Props = $props();

  const widths = ["w-3/4", "w-1/2", "w-2/3", "w-4/5", "w-3/5"];
</script>

{#if isLoading}
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {#each columns as column}
            <TableHead>{column.header}</TableHead>
          {/each}
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each Array(5) as _, rowIndex}
          <TableRow>
            {#each columns as column, colIndex}
              <TableCell>
                <Skeleton class={`h-4 ${widths[(rowIndex + colIndex) % widths.length]}`} />
              </TableCell>
            {/each}
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>
{:else if data.length === 0}
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {#each columns as column}
            <TableHead>{column.header}</TableHead>
          {/each}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colspan={columns.length} class="h-32">
            <div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Inbox class="h-8 w-8" />
              <p class="text-sm font-medium">No results found</p>
              <p class="text-xs">Try adjusting your search or filters</p>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
{:else}
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          {#each columns as column}
            <TableHead>
              {#if column.sortable && onSort}
                <Button
                  variant="ghost"
                  onclick={() => onSort(column.key)}
                  class="-ml-4"
                >
                  {column.header}
                  {#if sortField !== column.key}
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  {:else if sortDirection === "asc"}
                    <ArrowUp class="ml-2 h-4 w-4" />
                  {:else}
                    <ArrowDown class="ml-2 h-4 w-4" />
                  {/if}
                </Button>
              {:else}
                {column.header}
              {/if}
            </TableHead>
          {/each}
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each data as item (getRowKey(item))}
          <TableRow
            onclick={() => onRowClick?.(item)}
            class={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
          >
            {#each columns as column}
              <TableCell>
                {#if renderCell}
                  {@render renderCell({ item, column })}
                {:else if column.render}
                  {column.render(item)}
                {:else}
                  {String((item as Record<string, unknown>)[column.key] ?? "")}
                {/if}
              </TableCell>
            {/each}
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>
{/if}
