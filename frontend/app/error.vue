<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

async function handleGoHome() {
  await clearError()
  await navigateTo('/')
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 class="text-7xl font-bold mb-4">
        {{ error.statusCode }}
      </h1>

      <h2 class="text-xl font-bold mb-2">
        {{ is404 ? 'Página no encontrada' : 'Algo salió mal' }}
      </h2>

      <p class="text-zinc-500 mb-8 max-w-md">
        {{ is404
          ? 'La página que buscas no existe o fue movida.'
          : 'Ocurrió un error inesperado. Intenta de nuevo más tarde.' }}
      </p>

      <button
        @click="handleGoHome"
        class="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </button>
    </div>
  </NuxtLayout>
</template>