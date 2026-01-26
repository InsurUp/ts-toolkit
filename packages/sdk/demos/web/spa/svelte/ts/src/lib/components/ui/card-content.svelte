<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...restProps}>
  {@render children?.()}
</div>
