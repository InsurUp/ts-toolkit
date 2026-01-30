import { useDeferredValue, useState, useCallback } from "react";
import { useCustomerTable } from "@insurup/table-adapter-react";
import { flexRender } from "@tanstack/react-table";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

export function CustomerTable(): React.ReactElement {
  const client = useClient();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  // useCustomerTable returns a fully configured table
  // State changes (sorting, visibility, column order) go through table instance directly
  // Changes to sorting/visibility trigger refetch via adapter's onStateChange
  const { state, table, adapter } = useCustomerTable({
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
        sortDescFirst: true, // Newest first when sorting
        size: 120,
        minSize: 100,
        maxSize: 180,
        enableResizing: true,
      }),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pageSize: 10,
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
    // Initial table options - state changes go through table instance directly
    tableOptions: {
      columnResizeMode: "onChange",
      enableColumnResizing: true,
      debugTable: true,
      debugHeaders: true,
      debugColumns: true,
    },
  });

  // DnD sensors for drag-and-drop column reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get column IDs for sortable context (from table state)
  // Computed on each render - re-renders are triggered by adapter state changes
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

  const getSortIcon = (
    columnId: string
  ): React.ReactElement => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Customer table using useCustomerTable hook with TanStack Table.
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
      </div>

      <div className={searchInput !== deferredSearch ? "opacity-70" : "opacity-100"}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="w-full table-fixed">
            <TableHeader>
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
            {state.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {table.getAllColumns().map((col) => (
                    <TableCell key={col.id} className="overflow-hidden">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : state.error ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center text-destructive"
                >
                  Error: {state.error.message}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="overflow-hidden truncate">
                      {cell.column.id === "type" ? (
                        <Badge variant="outline">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Badge>
                      ) : cell.column.id === "createdAt" ? (
                        new Date(cell.getValue() as string).toLocaleDateString()
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext()) ?? "-"
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {state.pageCount || 1}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-16" disabled={state.isFetching}>
                  {state.isFetching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    table.getState().pagination.pageSize
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <DropdownMenuRadioItem key={size} value={String(size)}>
                      {size}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || state.isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || state.isFetching}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
