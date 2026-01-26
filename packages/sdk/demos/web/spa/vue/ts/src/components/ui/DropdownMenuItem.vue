<script setup lang="ts">
import { DropdownMenuItem } from "reka-ui";
import { cn } from "@/lib/utils";

interface Props {
  class?: string;
  inset?: boolean;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "select"): void;
}>();
</script>

<template>
  <DropdownMenuItem
    :disabled="disabled"
    :class="cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      inset && 'pl-8',
      props.class
    )"
    @select="emit('select')"
  >
    <slot />
  </DropdownMenuItem>
</template>
