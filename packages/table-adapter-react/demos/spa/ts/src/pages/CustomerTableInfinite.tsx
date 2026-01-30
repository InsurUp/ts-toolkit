import { useDeferredValue, useState, useCallback, useRef, useEffect } from "react";
import { useInfiniteCustomerTable } from "@insurup/table-adapter-react";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useClient } from "@/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DraggableTableHeader } from "@/components/DraggableTableHeader";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Settings2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export function CustomerTableInfinite(): React.ReactElement {
  const client = useClient();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  // Container ref for virtualization and scroll detection
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // useInfiniteCustomerTable handles row accumulation automatically!
  // state.rows contains ALL accumulated rows, not just the current page
  const { state, table, adapter } = useInfiniteCustomerTable({
    columns: (col) => [
      col.id({ 
        header: "ID", 
        sortable: true,
        size: 280,
        minSize: 100,
        maxSize: 400,
        enableResizing: true,
        enablePinning: true,
      }),
      col.name({ 
        header: "Name", 
        sortable: true,
        size: 180,
        minSize: 100,
        maxSize: 300,
        enableResizing: true,
      }),
      col.type({ 
        header: "Type", 
        sortable: true,
        size: 120,
        minSize: 80,
        maxSize: 200,
        enableResizing: true,
      }),
      col.primaryEmail({ 
        header: "Email", 
        sortable: true,
        size: 220,
        minSize: 150,
        maxSize: 350,
        enableResizing: true,
      }),
      col.primaryPhoneNumber({ 
        header: "Phone",
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
    pageSize: 100,
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
    tableOptions: {
      columnResizeMode: "onChange",
      enableColumnResizing: true,
      enableSortingRemoval: false,
      initialState: {
        sorting: [{ id: "createdAt", desc: true }],
      },
    },
  });

  // Row virtualizer for efficient rendering
  const rowVirtualizer = useVirtualizer({
    count: state.rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // estimated row height in px
    overscan: 10, // render 10 extra rows above/below viewport
  });

  // Load more when scrolling near bottom
  const loadMore = useCallback(() => {
    if (table.getCanNextPage() && !state.isFetching) {
      table.nextPage();
    }
  }, [table, state.isFetching]);

  // Scroll event handler for infinite scroll - uses container scroll
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Load more when within 200px of bottom
      if (distanceFromBottom < 200) {
        loadMore();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore]);

  // DnD sensors for drag-and-drop column reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get column IDs for sortable context - read from table state
  const tableColumnOrder = table.getState().columnOrder;
  const columnIds = tableColumnOrder.length > 0 
    ? tableColumnOrder 
    : table.getAllLeafColumns().map((c) => c.id);

  // Handle drag end for column reordering - use table.setColumnOrder directly
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const currentOrder = table.getState().columnOrder.length > 0
          ? table.getState().columnOrder
          : table.getAllLeafColumns().map((c) => c.id);
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
      }
    },
    [table]
  );

  const handleSearch = useCallback(
    (value: string): void => {
      setSearchInput(value);
      if (value.trim()) {
        adapter.setSearch({
          name: { textSearch: { value: value.trim() } },
        });
      } else {
        adapter.clearSearch();
      }
    },
    [adapter]
  );

  const handleRefresh = useCallback((): void => {
    adapter.invalidate();
    toast.success("Refreshing data...");
  }, [adapter]);

  const getSortIcon = (columnId: string): React.ReactElement => {
    const sorting = table.getState().sorting;
    const sortItem = sorting.find((s) => s.id === columnId);
    if (!sortItem) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortItem.desc ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  // Check if we've loaded all data
  const hasMoreData = table.getCanNextPage();
  const totalLoaded = state.rows.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers (Infinite Scroll)</h1>
          <p className="text-muted-foreground">
            Customer table with infinite scroll - scroll down to load more.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={state.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${state.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="text-sm text-muted-foreground">
          {totalLoaded} customers loaded
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Scrollable container with fixed height for virtualization */}
        <div
          ref={tableContainerRef}
          className={`h-[600px] overflow-auto rounded-md border ${searchInput !== deferredSearch ? "opacity-70" : "opacity-100"}`}
        >
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnIds}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader
                        key={header.id}
                        header={header}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && getSortIcon(header.column.id)}
                      </DraggableTableHeader>
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {state.isLoading && state.rows.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {table.getVisibleLeafColumns().map((col) => (
                      <TableCell key={col.id} className="overflow-hidden">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : state.error ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center text-destructive"
                  >
                    Error: {state.error.message}
                  </TableCell>
                </TableRow>
              ) : state.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Spacer row for virtual scroll offset */}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }} />
                  )}
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = state.rows[virtualRow.index];
                    const rowData = row as Record<string, unknown>;
                    const rowId = (rowData.id as string) || `row-${virtualRow.index}`;
                    
                    return (
                      <TableRow
                        key={rowId}
                        data-index={virtualRow.index}
                        className="hover:bg-muted/50"
                        style={{ height: `${virtualRow.size}px` }}
                      >
                        {table.getVisibleLeafColumns().map((column) => {
                          const value = rowData[column.id];
                          return (
                            <TableCell key={`${rowId}-${column.id}`} className="overflow-hidden truncate">
                              {column.id === "type" ? (
                                <Badge variant="outline">
                                  {String(value ?? "")}
                                </Badge>
                              ) : column.id === "createdAt" ? (
                                value ? new Date(value as string).toLocaleDateString() : "-"
                              ) : (
                                String(value ?? "-")
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {/* Spacer row for remaining virtual scroll space */}
                  {rowVirtualizer.getVirtualItems().length > 0 && (
                    <tr
                      style={{
                        height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)}px`,
                      }}
                    />
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {/* Loading indicator inside scroll container */}
          {state.isFetching && state.rows.length > 0 && (
            <div className="flex items-center justify-center py-4 sticky bottom-0 bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
            </div>
          )}

          {/* End of data indicator inside scroll container */}
          {!hasMoreData && state.rows.length > 0 && !state.isFetching && (
            <div className="flex items-center justify-center py-4">
              <span className="text-sm text-muted-foreground">
                All {state.rows.length} customers loaded
              </span>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
