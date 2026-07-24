<script setup lang="ts">
const cartStore = useCartStore()
const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
    <header
      class="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-50">
      <nav class="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold">
          MiTienda
        </NuxtLink>

        <div class="hidden md:flex gap-6 text-sm">
          <NuxtLink to="/" class="hover:text-zinc-500 dark:hover:text-zinc-400">Inicio</NuxtLink>
          <NuxtLink to="/productos" class="hover:text-zinc-500 dark:hover:text-zinc-400">Productos</NuxtLink>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink v-if="!authStore.isLoggedIn" to="/login"
            class="text-sm hover:text-zinc-500 dark:hover:text-zinc-400">
            Ingresar
          </NuxtLink>

          <div v-else class="flex items-center gap-2 text-sm">
            <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin"
              class="hover:text-zinc-500 dark:hover:text-zinc-400">
              Admin
            </NuxtLink>
            <NuxtLink to="/cuenta" class="hidden sm:inline hover:text-zinc-500 dark:hover:text-zinc-400">
              {{ authStore.user?.fullName }}
            </NuxtLink>
            <button
              @click="async () => { authStore.logout(); useToast().showToast('Sesión cerrada', 'info'); await navigateTo('/') }"
              class="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              Cerrar sesión
            </button>
          </div>

          <ThemeToggle />

          <NuxtLink to="/carrito" class="relative">
            🛒
            <span
              class="absolute -top-2 -right-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartStore.totalItems }}
            </span>
          </NuxtLink>

          <MobileMenu />
        </div>
      </nav>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-zinc-200 dark:border-zinc-800 mt-10 py-8 text-center text-sm text-zinc-500">
      © {{ new Date().getFullYear() }} MiTienda. Todos los derechos reservados.
    </footer>

    <ToastContainer />
  </div>
</template>