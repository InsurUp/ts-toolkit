<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Props {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading?: boolean;
  totalCount?: number | null;
  pageSize?: number;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: null,
  pageSize: 10,
  currentPage: 1,
});

const emit = defineEmits<{
  (e: "next"): void;
  (e: "previous"): void;
}>();

const hasTotal = computed(() => props.totalCount != null);
const start = computed(() => (props.currentPage - 1) * props.pageSize + 1);
const end = computed(() =>
  hasTotal.value
    ? Math.min(props.currentPage * props.pageSize, props.totalCount!)
    : props.currentPage * props.pageSize
);
const totalPages = computed(() =>
  hasTotal.value ? Math.ceil(props.totalCount! / props.pageSize) : null
);
</script>

<template>
  <div class="flex items-center justify-between py-4">
    <div class="text-sm text-muted-foreground">
      <template v-if="hasTotal">
        Showing {{ start }}-{{ end }} of {{ totalCount!.toLocaleString() }} items
        <template v-if="totalPages">
          (Page {{ currentPage }} of {{ totalPages }})
        </template>
      </template>
      <template v-else>
        Page {{ currentPage }}
      </template>
    </div>
    <div class="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="!hasPreviousPage || isLoading"
        @click="emit('previous')"
      >
        <ChevronLeft class="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        :disabled="!hasNextPage || isLoading"
        @click="emit('next')"
      >
        Next
        <ChevronRight class="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
</template>
