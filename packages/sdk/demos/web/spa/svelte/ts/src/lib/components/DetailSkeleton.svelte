<script lang="ts">
  import { Skeleton, Card, CardHeader, CardContent } from "$lib/components/ui";

  interface Props {
    title?: boolean;
    cardCount?: number;
    rowsPerCard?: number;
  }

  let { title = true, cardCount = 4, rowsPerCard = 4 }: Props = $props();
</script>

<div class="space-y-6 animate-in fade-in-50 duration-300">
  {#if title}
    <div class="flex items-center gap-4">
      <Skeleton class="h-10 w-10 rounded-md" />
      <div class="space-y-2">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-4 w-32" />
      </div>
    </div>
  {/if}
  <div class="grid gap-6 md:grid-cols-2">
    {#each Array(cardCount) as _, cardIndex}
      <Card class="overflow-hidden">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-5 w-32" />
          </div>
          <Skeleton class="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent class="space-y-4">
          {#each Array(rowsPerCard) as _, rowIndex}
            <div class="flex items-center justify-between">
              <Skeleton class="h-4 w-24" />
              <Skeleton class={`h-4 ${rowIndex % 2 === 0 ? "w-20" : "w-28"}`} />
            </div>
          {/each}
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
