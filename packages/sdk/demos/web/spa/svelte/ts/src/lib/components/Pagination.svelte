<script lang="ts">
  import { Button } from "$lib/components/ui";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";

  interface Props {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onNext: () => void;
    onPrevious: () => void;
    isLoading?: boolean;
    totalCount?: number | null;
    pageSize?: number;
    currentPage?: number;
  }

  let {
    hasNextPage,
    hasPreviousPage,
    onNext,
    onPrevious,
    isLoading = false,
    totalCount = null,
    pageSize = 10,
    currentPage = 1,
  }: Props = $props();

  const hasTotal = $derived(totalCount != null);
  const start = $derived((currentPage - 1) * pageSize + 1);
  const end = $derived(hasTotal ? Math.min(currentPage * pageSize, totalCount!) : currentPage * pageSize);
  const totalPages = $derived(hasTotal ? Math.ceil(totalCount! / pageSize) : null);
</script>

<div class="flex items-center justify-between py-4">
  <div class="text-sm text-muted-foreground">
    {#if hasTotal}
      Showing {start}-{end} of {totalCount!.toLocaleString()} items
      {#if totalPages}
        (Page {currentPage} of {totalPages})
      {/if}
    {:else}
      Page {currentPage}
    {/if}
  </div>
  <div class="flex items-center space-x-2">
    <Button
      variant="outline"
      size="sm"
      onclick={onPrevious}
      disabled={!hasPreviousPage || isLoading}
    >
      <ChevronLeft class="h-4 w-4 mr-1" />
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={onNext}
      disabled={!hasNextPage || isLoading}
    >
      Next
      <ChevronRight class="h-4 w-4 ml-1" />
    </Button>
  </div>
</div>
