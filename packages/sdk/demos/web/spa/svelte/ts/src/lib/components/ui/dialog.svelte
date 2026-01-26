<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  interface Props {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
  }

  let { open = $bindable(false), onOpenChange, children }: Props = $props();
</script>

<DialogPrimitive.Root bind:open {onOpenChange}>
  {@render children?.()}
</DialogPrimitive.Root>
