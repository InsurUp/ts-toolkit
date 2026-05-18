<script setup lang="ts" generic="T">
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Skeleton,
} from '@/components/ui';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-vue-next';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => string;
}

interface Props {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  sortField?: string | null;
  sortDirection?: SortDirection;
  getRowKey: (item: T) => string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  sortField: null,
  sortDirection: null,
});

const emit = defineEmits<{
  (e: 'sort', field: string): void;
  (e: 'rowClick', item: T): void;
}>();

const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5'];

function getCellValue(item: T, column: Column<T>): string {
  if (column.render) {
    return column.render(item);
  }
  return String((item as Record<string, unknown>)[column.key] ?? '');
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="column in columns" :key="column.key">
            {{ column.header }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="rowIndex in 5" :key="rowIndex">
          <TableCell v-for="(column, colIndex) in columns" :key="column.key">
            <Skeleton :class="`h-4 ${widths[(rowIndex + colIndex) % widths.length]}`" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <!-- Empty state -->
  <div v-else-if="data.length === 0" class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="column in columns" :key="column.key">
            {{ column.header }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell :colspan="columns.length" class="h-32">
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

  <!-- Data table -->
  <div v-else class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-for="column in columns" :key="column.key">
            <Button
              v-if="column.sortable"
              variant="ghost"
              class="-ml-4"
              @click="emit('sort', column.key)"
            >
              {{ column.header }}
              <ArrowUpDown v-if="sortField !== column.key" class="ml-2 h-4 w-4" />
              <ArrowUp v-else-if="sortDirection === 'asc'" class="ml-2 h-4 w-4" />
              <ArrowDown v-else class="ml-2 h-4 w-4" />
            </Button>
            <template v-else>{{ column.header }}</template>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="item in data"
          :key="getRowKey(item)"
          class="cursor-pointer hover:bg-muted/50"
          @click="emit('rowClick', item)"
        >
          <TableCell v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :item="item" :column="column">
              {{ getCellValue(item, column) }}
            </slot>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
