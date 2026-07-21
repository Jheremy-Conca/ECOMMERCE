<script setup lang="ts">
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    @click="toggleTheme"
    class="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 dark:border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors"
  >
    <span v-if="colorMode.value === 'dark'">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>