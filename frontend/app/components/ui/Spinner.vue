<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
}
</script>

<template>
  <div
    :class="[
      'rounded-full border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white animate-spin',
      sizeClasses[size],
    ]"
  />
</template>