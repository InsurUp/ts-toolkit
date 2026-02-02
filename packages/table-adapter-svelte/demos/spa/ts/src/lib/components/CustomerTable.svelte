<script lang="ts">
  import { onDestroy } from "svelte";
  import { createCustomerTable } from "@insurup/table-adapter-svelte";
  import { getClient } from "$lib/client";
  import { toast } from "svelte-sonner";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, type DndEvent } from "svelte-dnd-action";
  import {
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Settings2,
    GripVertical,
    Pin,
    PinOff,
  } from "@lucide/svelte";

  const client = getClient();
  let searchInput = $state("");
  let showColumnMenu = $state(false);
  let showPinMenu = $state<string | null>(null); // Track which column's pin menu is open
  let pinMenuPosition = $state<{ top: number; left: number } | null>(null); // Position for fixed dropdown

  // Create customer table instance with resizing enabled
  const ct = createCustomerTable(() => ({
    columns: (col) => [
      col.id({ 
        header: "ID", 
        hiddenByDefault: true,
        size: 280,
        minSize: 100,
        maxSize: 400,
        enableResizing: true,
      }),
      col.name({
        header: "Name",
        size: 180,
        minSize: 100,
        maxSize: 300,
        enableResizing: true,
      }),
      col.type({
        header: "Type",
        size: 120,
        minSize: 80,
        maxSize: 200,
        enableResizing: true,
      }),
      col.primaryEmail({
        header: "Email",
        size: 220,
        minSize: 150,
        maxSize: 350,
        enableResizing: true,
      }),
      col.primaryPhoneNumber({ 
        header: "Phone", 
        hiddenByDefault: true,
        size: 140,
        minSize: 100,
        maxSize: 200,
        enableResizing: true,
      }),
      col.createdAt({ 
        header: "Created", 
        sortable: true,
        sortDescFirst: true,
        size: 120,
        minSize: 100,
        maxSize: 180,
        enableResizing: true,
      }),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pagination: { type: 'cursor', pageSize: 10 },
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
    tableOptions: {
      enableSorting: true,
      columnResizeMode: "onChange",
      enableColumnResizing: true,
      enablePinning: true,
    },
    initialState: {
      columnPinning: {
        left: [],
        right: [],
      },
    },
  }));

  onDestroy(() => ct.destroy());

  // Get column info for the dropdown
  const columnInfo = ct.adapter.getColumnInfo();

  // Page size options
  const pageSizeOptions = [10, 20, 50, 100];

  function toggleColumn(columnKey: string): void {
    ct.table.getColumn(columnKey)?.toggleVisibility();
  }

  function handleSearch(value: string): void {
    searchInput = value;
    if (value.trim()) {
      ct.adapter.setSearch({
        name: { textSearch: { value: value.trim() } },
      });
    } else {
      ct.adapter.clearSearch();
    }
  }

  function handleRefresh(): void {
    ct.adapter.invalidate();
    toast.success("Refreshing data...");
  }

  function formatDate(dateStr: unknown): string {
    if (typeof dateStr !== "string") return "-";
    return new Date(dateStr).toLocaleDateString();
  }

  function getSortIcon(columnId: string): "asc" | "desc" | "none" {
    const sorting = ct.table.getState().sorting;
    const sortItem = sorting.find((s) => s.id === columnId);
    if (!sortItem) return "none";
    return sortItem.desc ? "desc" : "asc";
  }

  // DnD column ordering
  interface DndHeaderItem {
    id: string;
    headerId: string;
    [SHADOW_ITEM_MARKER_PROPERTY_NAME]?: boolean;
  }

  // Helper to get unique key for dnd items (shadow items need different keys)
  function getDndItemKey(item: DndHeaderItem): string {
    return item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? `${item.id}-shadow` : item.id;
  }

  // Get current visible headers for DnD - wrapped in a function to be reactive
  function getDndHeaders(): DndHeaderItem[] {
    const headerGroups = ct.table.getHeaderGroups();
    if (headerGroups.length === 0) return [];
    const headers = headerGroups[0].headers;
    return headers.map((h) => ({ id: h.column.id, headerId: h.id }));
  }

  // State for drag-and-drop items
  let dndItems = $state<DndHeaderItem[]>(getDndHeaders());
  let isDragging = $state(false);

  // Track resizing column reactively for proper UI updates
  let resizingColumnId = $derived(ct.table.getState().columnSizingInfo.isResizingColumn);

  // Keep dndItems in sync with table headers (but not during drag)
  $effect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/f6903c78-7cee-4eee-9f24-304da23f0a01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerTable.svelte:$effect',message:'Effect running',data:{isDragging,dndItemsCount:dndItems.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (isDragging) return;
    const newHeaders = getDndHeaders();
    // Only update if the IDs actually changed (not just the reference)
    const currentIds = dndItems
      .filter((i) => !i[SHADOW_ITEM_MARKER_PROPERTY_NAME])
      .map((i) => i.id)
      .join(",");
    const newIds = newHeaders.map((i) => i.id).join(",");
    if (currentIds !== newIds) {
      // #region agent log
      fetch('http://127.0.0.1:7249/ingest/f6903c78-7cee-4eee-9f24-304da23f0a01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerTable.svelte:$effect',message:'Effect UPDATING dndItems',data:{currentIds,newIds},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      dndItems = newHeaders;
    }
  });

  function handleDndConsider(e: CustomEvent<DndEvent<DndHeaderItem>>): void {
    isDragging = true;
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/f6903c78-7cee-4eee-9f24-304da23f0a01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerTable.svelte:handleDndConsider',message:'DnD consider - items received',data:{itemCount:e.detail.items.length,items:e.detail.items.map(i=>({id:i.id,isShadow:!!i[SHADOW_ITEM_MARKER_PROPERTY_NAME]}))},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    dndItems = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<DndEvent<DndHeaderItem>>): void {
    isDragging = false;
    // Filter out shadow items when finalizing
    const finalItems = e.detail.items.filter(
      (item) => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]
    );
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/f6903c78-7cee-4eee-9f24-304da23f0a01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerTable.svelte:handleDndFinalize',message:'DnD finalize - final items',data:{rawCount:e.detail.items.length,finalCount:finalItems.length,finalItems:finalItems.map(i=>i.id)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C'})}).catch(()=>{});
    // #endregion
    dndItems = finalItems;
    const newOrder = finalItems.map((item) => item.id);
    ct.table.setColumnOrder(newOrder);
  }

  // Get header by column ID
  function getHeader(columnId: string) {
    const headerGroups = ct.table.getHeaderGroups();
    if (headerGroups.length === 0) return null;
    const header = headerGroups[0].headers.find((h) => h.column.id === columnId) ?? null;
    // #region agent log
    if (!header) { fetch('http://127.0.0.1:7249/ingest/f6903c78-7cee-4eee-9f24-304da23f0a01',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CustomerTable.svelte:getHeader',message:'Header NOT FOUND for columnId',data:{columnId,availableHeaders:headerGroups[0]?.headers.map(h=>h.column.id)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{}); }
    // #endregion
    return header;
  }

  // Calculate percentage width for a header
  function getPercentWidth(header: ReturnType<typeof getHeader>): number {
    if (!header) return 0;
    const totalSize = ct.table.getTotalSize();
    return (header.getSize() / totalSize) * 100;
  }

  // Handle page size change
  function handlePageSizeChange(e: Event): void {
    const target = e.currentTarget as HTMLSelectElement;
    ct.table.setPageSize(Number(target.value));
  }

  // Column pinning helpers
  function pinColumn(columnId: string, position: "left" | "right" | false): void {
    const column = ct.table.getColumn(columnId);
    if (column) {
      column.pin(position);
    }
    showPinMenu = null;
    pinMenuPosition = null;
  }

  function getColumnPinState(columnId: string): "left" | "right" | false {
    const column = ct.table.getColumn(columnId);
    return column?.getIsPinned() ?? false;
  }

  function openPinMenu(e: MouseEvent, columnId: string): void {
    e.stopPropagation();
    if (showPinMenu === columnId) {
      showPinMenu = null;
      pinMenuPosition = null;
    } else {
      const button = e.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      pinMenuPosition = {
        top: rect.bottom + 4,
        left: Math.min(rect.right - 128, window.innerWidth - 140), // 128 = dropdown width, ensure it stays on screen
      };
      showPinMenu = columnId;
    }
  }

  // Get sticky position for pinned columns
  function getStickyStyle(header: ReturnType<typeof getHeader>): string {
    if (!header) return "";
    const isPinned = header.column.getIsPinned();
    if (!isPinned) return "";
    
    if (isPinned === "left") {
      const leftOffset = header.column.getStart("left");
      return `position: sticky; left: ${leftOffset}px; z-index: 1;`;
    }
    if (isPinned === "right") {
      const rightOffset = header.column.getAfter("right");
      return `position: sticky; right: ${rightOffset}px; z-index: 1;`;
    }
    return "";
  }

  // Get pinned column class for visual styling
  function getPinnedClass(header: ReturnType<typeof getHeader>): string {
    if (!header) return "";
    const isPinned = header.column.getIsPinned();
    if (!isPinned) return "";
    
    const isLastLeft = header.column.getIsLastColumn("left");
    const isFirstRight = header.column.getIsFirstColumn("right");
    
    let classes = "bg-background";
    if (isLastLeft) classes += " shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]";
    if (isFirstRight) classes += " shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]";
    
    return classes;
  }

  // Close pin menu when clicking outside (using document listener for a11y)
  $effect(() => {
    if (!showPinMenu) return;
    
    function handleClickOutside(e: MouseEvent): void {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-pin-menu]')) {
        showPinMenu = null;
        pinMenuPosition = null;
      }
    }

    // Close on scroll to prevent misaligned menu
    function handleScroll(): void {
      showPinMenu = null;
      pinMenuPosition = null;
    }
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Customers</h1>
      <p class="text-muted-foreground">
        Customer table with column pinning, drag-and-drop ordering, and resizing.
      </p>
    </div>
    <button
      class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent"
      disabled={ct.isLoading}
      onclick={handleRefresh}
    >
      <RefreshCw class="h-4 w-4 {ct.isLoading ? 'animate-spin' : ''}" />
      Refresh
    </button>
  </div>

  <div class="flex items-center gap-4">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search customers..."
        bind:value={searchInput}
        class="h-9 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm"
        oninput={(e) => handleSearch(e.currentTarget.value)}
      />
    </div>

    <!-- Column visibility dropdown -->
    <div class="relative">
      <button
        class="inline-flex items-center gap-2 h-9 px-4 rounded-md border bg-background hover:bg-accent"
        onclick={() => showColumnMenu = !showColumnMenu}
      >
        <Settings2 class="h-4 w-4" />
        Columns
      </button>
      {#if showColumnMenu}
        <div class="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-10">
          <div class="p-2">
            <p class="text-xs font-medium text-muted-foreground mb-2 px-2">Toggle columns</p>
            {#each columnInfo.filter((c) => c.hideable) as col (col.key)}
              <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer">
                <input
                  type="checkbox"
                  checked={ct.table.getState().columnVisibility[col.key] !== false}
                  onchange={() => toggleColumn(col.key)}
                  class="h-4 w-4 rounded border"
                />
                <span class="text-sm">{col.header}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="relative w-full overflow-x-auto rounded-md border">
    <table class="w-full caption-bottom text-sm" style="table-layout: fixed; min-width: 800px;">
      <thead class="[&_tr]:border-b bg-muted/50">
        <tr
          use:dndzone={{
            items: dndItems,
            flipDurationMs: 200,
            type: "columns",
          }}
          onconsider={handleDndConsider}
          onfinalize={handleDndFinalize}
          class="flex w-full"
        >
          {#each dndItems as item (getDndItemKey(item))}
            {@const header = getHeader(item.id)}
            {@const isShadowPlaceholder = !header && item.id.includes('dnd-shadow-placeholder')}
            {@const pinState = getColumnPinState(item.id)}
            {#if header}
              <th
                class="group relative flex h-10 items-center px-2 text-left align-middle font-medium text-foreground whitespace-nowrap select-none {getPinnedClass(header)}"
                style="width: {getPercentWidth(header)}%; {getStickyStyle(header)}"
              >
                <!-- Drag handle (only for unpinned columns) -->
                {#if !pinState}
                  <button
                    type="button"
                    class="mr-1 cursor-grab touch-none opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                  >
                    <GripVertical class="h-4 w-4 text-muted-foreground" />
                  </button>
                {/if}

                <!-- Pin indicator for pinned columns -->
                {#if pinState}
                  <div class="mr-1 flex items-center">
                    <Pin class="h-3 w-3 text-primary {pinState === 'right' ? 'rotate-90' : '-rotate-90'}" />
                  </div>
                {/if}

                <!-- Header content -->
                {#if header.column.getCanSort()}
                  {@const sortDir = getSortIcon(header.column.id)}
                  <button
                    type="button"
                    class="flex flex-1 items-center overflow-hidden cursor-pointer bg-transparent border-none p-0 text-left font-inherit text-inherit"
                    onclick={header.column.getToggleSortingHandler()}
                  >
                    {#if !header.isPlaceholder}
                      {#if typeof header.column.columnDef.header === "string"}
                        <span class="truncate">{header.column.columnDef.header}</span>
                      {:else}
                        <span class="truncate">{header.column.id}</span>
                      {/if}
                    {/if}
                    {#if sortDir === "desc"}
                      <ArrowDown class="ml-2 h-4 w-4 shrink-0" />
                    {:else if sortDir === "asc"}
                      <ArrowUp class="ml-2 h-4 w-4 shrink-0" />
                    {:else}
                      <ArrowUpDown class="ml-2 h-4 w-4 shrink-0" />
                    {/if}
                  </button>
                {:else}
                  <span class="flex flex-1 items-center overflow-hidden">
                    {#if !header.isPlaceholder}
                      {#if typeof header.column.columnDef.header === "string"}
                        <span class="truncate">{header.column.columnDef.header}</span>
                      {:else}
                        <span class="truncate">{header.column.id}</span>
                      {/if}
                    {/if}
                  </span>
                {/if}

                <!-- Pin menu button -->
                <div class="relative" data-pin-menu>
                  <button
                    type="button"
                    class="ml-1 p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity {showPinMenu === item.id ? 'opacity-100 bg-accent' : ''}"
                    onclick={(e) => openPinMenu(e, item.id)}
                    aria-label="Pin column"
                  >
                    {#if pinState}
                      <PinOff class="h-3 w-3 text-muted-foreground" />
                    {:else}
                      <Pin class="h-3 w-3 text-muted-foreground" />
                    {/if}
                  </button>
                </div>

                <!-- Resize handle -->
                <button
                  type="button"
                  onmousedown={header.getResizeHandler()}
                  ontouchstart={header.getResizeHandler()}
                  ondblclick={() => header.column.resetSize()}
                  class="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize select-none touch-none bg-border hover:bg-primary border-none p-0 {resizingColumnId === header.column.id ? 'bg-primary' : ''}"
                  aria-label="Resize column"
                ></button>
              </th>
            {:else if isShadowPlaceholder}
              <!-- Shadow placeholder for drag-and-drop - renders empty space where dragged item will land -->
              <th
                class="relative flex h-10 items-center px-2 text-left align-middle font-medium text-foreground whitespace-nowrap select-none bg-muted/30"
                style="flex: 1; min-width: 100px;"
              ></th>
            {/if}
          {/each}
        </tr>
      </thead>
      <tbody class="[&_tr:last-child]:border-0">
        {#if ct.isLoading}
          {#each {length: 5} as _}
            <tr class="flex w-full border-b">
              {#each dndItems as item (getDndItemKey(item))}
                {@const header = getHeader(item.id)}
                {@const isShadowPlaceholder = !header && item.id.includes('dnd-shadow-placeholder')}
                {#if header}
                  <td 
                    class="p-2 {getPinnedClass(header)}" 
                    style="width: {getPercentWidth(header)}%; {getStickyStyle(header)}"
                  >
                    <div class="h-4 w-full bg-accent animate-pulse rounded-md"></div>
                  </td>
                {:else if isShadowPlaceholder}
                  <td class="p-2" style="flex: 1; min-width: 100px;"></td>
                {/if}
              {/each}
            </tr>
          {/each}
        {:else if ct.error}
          <tr class="flex w-full">
            <td
              colspan={dndItems.length}
              class="h-24 text-center text-destructive w-full flex items-center justify-center"
            >
              Error: {ct.error.message}
            </td>
          </tr>
        {:else if ct.table.getRowModel().rows.length === 0}
          <tr class="flex w-full">
            <td
              colspan={dndItems.length}
              class="h-24 text-center w-full flex items-center justify-center"
            >
              No customers found.
            </td>
          </tr>
        {:else}
          {#each ct.table.getRowModel().rows as row (row.id)}
            <tr class="flex w-full border-b hover:bg-muted/50">
              {#each dndItems as item (getDndItemKey(item))}
                {@const header = getHeader(item.id)}
                {@const cell = row.getVisibleCells().find((c) => c.column.id === item.id)}
                {@const isShadowPlaceholder = !header && item.id.includes('dnd-shadow-placeholder')}
                {#if header && cell}
                  <td 
                    class="p-2 align-middle overflow-hidden truncate {getPinnedClass(header)}" 
                    style="width: {getPercentWidth(header)}%; {getStickyStyle(header)}"
                  >
                    {#if cell.column.id === "type"}
                      <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                        {cell.getValue() ?? "-"}
                      </span>
                    {:else if cell.column.id === "createdAt"}
                      {formatDate(cell.getValue())}
                    {:else}
                      {cell.getValue() ?? "-"}
                    {/if}
                  </td>
                {:else if isShadowPlaceholder}
                  <td class="p-2 align-middle bg-muted/30" style="flex: 1; min-width: 100px;"></td>
                {/if}
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="text-sm text-muted-foreground">
        Page {ct.table.getState().pagination.pageIndex + 1} of {ct.pageCount || 1}
      </div>

      <!-- Page size selector -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Rows per page</span>
        <select
          class="h-8 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
          value={ct.table.getState().pagination.pageSize}
          onchange={handlePageSizeChange}
          disabled={ct.isFetching}
        >
          {#each pageSizeOptions as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="flex items-center space-x-2">
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanPreviousPage() || ct.isLoading}
        onclick={() => ct.table.previousPage()}
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </button>
      <button
        class="inline-flex items-center gap-1 h-8 px-3 rounded-md border bg-background hover:bg-accent disabled:opacity-50"
        disabled={!ct.table.getCanNextPage() || ct.isLoading}
        onclick={() => ct.table.nextPage()}
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</div>

<!-- Pin menu dropdown (rendered with fixed positioning to avoid clipping) -->
{#if showPinMenu && pinMenuPosition}
  {@const columnId = showPinMenu}
  {@const currentPinState = getColumnPinState(columnId)}
  <div 
    class="fixed w-32 rounded-md border bg-background shadow-lg z-50"
    style="top: {pinMenuPosition.top}px; left: {pinMenuPosition.left}px;"
    data-pin-menu
  >
    <div class="p-1">
      {#if currentPinState !== "left"}
        <button
          type="button"
          class="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-left"
          onclick={() => pinColumn(columnId, "left")}
        >
          <Pin class="h-3 w-3 -rotate-90" />
          Pin Left
        </button>
      {/if}
      {#if currentPinState !== "right"}
        <button
          type="button"
          class="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-left"
          onclick={() => pinColumn(columnId, "right")}
        >
          <Pin class="h-3 w-3 rotate-90" />
          Pin Right
        </button>
      {/if}
      {#if currentPinState}
        <button
          type="button"
          class="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-left"
          onclick={() => pinColumn(columnId, false)}
        >
          <PinOff class="h-3 w-3" />
          Unpin
        </button>
      {/if}
    </div>
  </div>
{/if}
