<script setup lang="ts">
import { Skeleton, Card, CardHeader, CardContent } from '@/components/ui';

interface Props {
  title?: boolean;
  cardCount?: number;
  rowsPerCard?: number;
}

withDefaults(defineProps<Props>(), {
  title: true,
  cardCount: 4,
  rowsPerCard: 4,
});
</script>

<template>
  <div class="space-y-6 animate-in fade-in-50 duration-300">
    <div v-if="title" class="flex items-center gap-4">
      <Skeleton class="h-10 w-10 rounded-md" />
      <div class="space-y-2">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-4 w-32" />
      </div>
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <Card v-for="cardIndex in cardCount" :key="cardIndex" class="overflow-hidden">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-5 w-32" />
          </div>
          <Skeleton class="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="rowIndex in rowsPerCard"
            :key="rowIndex"
            class="flex items-center justify-between"
          >
            <Skeleton class="h-4 w-24" />
            <Skeleton :class="`h-4 ${rowIndex % 2 === 0 ? 'w-20' : 'w-28'}`" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
