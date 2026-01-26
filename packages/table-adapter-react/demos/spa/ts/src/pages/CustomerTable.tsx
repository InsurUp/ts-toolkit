import { useDeferredValue, useState, useCallback } from "react";
import { useCustomerTable } from "@insurup/table-adapter-react";
import { flexRender } from "@tanstack/react-table";
import { useClient } from "@/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function CustomerTable(): React.ReactElement {
  const client = useClient();
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  const { state, table, adapter } = useCustomerTable({
    columns: (col) => [
      col.id(),
      col.name(),
      col.type(),
      col.primaryEmail(),
      col.primaryPhoneNumber(),
      col.createdAt(),
    ],
    fetch: (options) => client.customers.getCustomers(options),
    pageSize: 10,
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load customers: ${error.message}`);
    },
  });

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
        <Button variant="outline" onClick={handleRefresh} disabled={state.isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`} />
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
      </div>

      <div style={{ opacity: searchInput !== deferredSearch ? 0.7 : 1 }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && getSortIcon(header.column.id)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {state.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {table.getAllColumns().map((col) => (
                    <TableCell key={col.id}>
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
                    <TableCell key={cell.id}>
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
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {state.pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || state.isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || state.isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
