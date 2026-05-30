import { useDeferredValue, useState, useCallback } from 'react';
import { useRoleTable } from '@insurup/table-adapter-react';
import { flexRender } from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useClient } from '@/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { DraggableTableHeader } from '@/components/DraggableTableHeader';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Roles table backed by the in-memory `useRoleTable` hook.
 *
 * Unlike the GraphQL-backed customer table, the agent-roles endpoint returns a
 * plain array. The list is fetched once via `fetchAll`, and search, sorting and
 * pagination all run client-side — no extra network calls as you interact.
 */
export function RoleTable(): React.ReactElement {
  const client = useClient();
  const [searchInput, setSearchInput] = useState('');
  const deferredSearch = useDeferredValue(searchInput);

  const { state, table, adapter } = useRoleTable({
    columns: (col) => [
      col.id({
        header: 'ID',
        sortable: true,
        size: 300,
        minSize: 120,
        maxSize: 420,
        enableResizing: true,
        enablePinning: true,
      }),
      col.name({
        header: 'Name',
        sortable: true,
        size: 200,
        minSize: 120,
        maxSize: 320,
        enableResizing: true,
      }),
      col.permissions({
        header: 'Permissions',
        size: 160,
        minSize: 120,
        maxSize: 260,
        enableResizing: true,
      }),
      col.createdAt({
        header: 'Created',
        sortable: true,
        sortDescFirst: true,
        size: 140,
        minSize: 100,
        maxSize: 200,
        enableResizing: true,
      }),
    ],
    // In-memory data source: one fetch of the full list.
    fetchAll: () => client.agentRoles.getAgentRoles(),
    pagination: { type: 'cursor', pageSize: 5 },
    autoFetch: true,
    onError: (error) => {
      toast.error(`Failed to load roles: ${error.message}`);
    },
    tableOptions: {
      columnResizeMode: 'onChange',
      enableColumnResizing: true,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const tableColumnOrder = table.getState().columnOrder;
  const columnIds =
    tableColumnOrder.length > 0 ? tableColumnOrder : table.getAllLeafColumns().map((c) => c.id);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const currentOrder =
          table.getState().columnOrder.length > 0
            ? table.getState().columnOrder
            : table.getAllLeafColumns().map((c) => c.id);
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);
        table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
      }
    },
    [table]
  );

  // Global $search across the table's text columns — applied in memory.
  const handleSearch = useCallback(
    (value: string): void => {
      setSearchInput(value);
      if (value.trim()) {
        adapter.setFilter({ $search: value.trim() });
      } else {
        adapter.clearFilter();
      }
    },
    [adapter]
  );

  const handleRefresh = useCallback((): void => {
    adapter.invalidate();
    toast.success('Refreshing roles...');
  }, [adapter]);

  const getSortIcon = (columnId: string): React.ReactElement => {
    const sortItem = table.getState().sorting.find((s) => s.id === columnId);
    if (!sortItem) return <ArrowUpDown className="ml-2 h-4 w-4" />;
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
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            In-memory table via <code>useRoleTable</code> — search, sort and pagination run
            client-side over a single fetch.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={state.isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${state.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
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
            {table
              .getAllColumns()
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

      <div className={searchInput !== deferredSearch ? 'opacity-70' : 'opacity-100'}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader
                        key={header.id}
                        header={header}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
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
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="overflow-hidden truncate">
                        {cell.column.id === 'permissions' ? (
                          <Badge variant="outline">
                            {(cell.getValue() as string[] | null)?.length ?? 0} permissions
                          </Badge>
                        ) : cell.column.id === 'createdAt' ? (
                          new Date(cell.getValue() as string).toLocaleString()
                        ) : (
                          (flexRender(cell.column.columnDef.cell, cell.getContext()) ?? '-')
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
            Page {table.getState().pagination.pageIndex + 1} of {state.pageCount || 1} ·{' '}
            {state.rowCount ?? 0} roles
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
                  {[5, 10, 20, 50].map((size) => (
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
