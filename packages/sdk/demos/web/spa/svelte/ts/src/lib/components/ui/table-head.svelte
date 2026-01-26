<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLThAttributes } from "svelte/elements";

  interface Props extends HTMLThAttributes {}

  let { class: className, children, ...restProps }: Props = $props();
</script>

<th
  class={cn(
    "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
    className
  )}
  {...restProps}
>
  {@render children?.()}
</th>
