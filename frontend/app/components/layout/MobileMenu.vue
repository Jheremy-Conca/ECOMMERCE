<script setup lang="ts">
const isOpen = ref(false)
const authStore = useAuthStore()

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleLogout() {
  authStore.logout()
  close()
  useToast().showToast('Sesión cerrada', 'info')
  navigateTo('/')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="md:hidden">
    <button @click="toggle" class="text-2xl leading-none text-zinc-900 dark:text-zinc-100" aria-label="Abrir menú">
      ☰
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-40" @click="close" />

      <div
        class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-zinc-800 z-50 transition-transform duration-300 p-6 flex flex-col"
        :class="isOpen ? 'translate-x-0' : 'translate-x-full'" role="dialog" aria-modal="true" @keydown="handleKeydown">
        <button @click="close" class="text-2xl mb-8 block self-start" aria-label="Cerrar menú">
          ✕
        </button>

        <nav class="flex flex-col gap-4 text-lg">
          <NuxtLink to="/" @click="close">Inicio</NuxtLink>
          <NuxtLink to="/productos" @click="close">Productos</NuxtLink>
        </nav>

        <div class="border-t border-zinc-200 dark:border-zinc-800 mt-6 pt-6 flex flex-col gap-4 text-lg">
          <template v-if="authStore.isLoggedIn">
            <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin" @click="close">Admin</NuxtLink>
            <NuxtLink to="/cuenta" @click="close">Mi cuenta</NuxtLink>
            <button @click="handleLogout" class="text-left text-zinc-500">Cerrar sesión</button>
          </template>
          <NuxtLink v-else to="/login" @click="close">Ingresar</NuxtLink>
        </div>
      </div>
    </Teleport>
  </div>
</template>