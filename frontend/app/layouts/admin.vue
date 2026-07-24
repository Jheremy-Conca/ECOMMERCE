<script setup lang="ts">
const authStore = useAuthStore()

const navLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/productos', label: 'Productos' },
    { to: '/admin/categorias', label: 'Categorías' },
    { to: '/admin/pedidos', label: 'Pedidos' },
]

async function handleLogout() {
    authStore.logout()
    await navigateTo('/')
}
</script>

<template>
    <div class="min-h-screen flex flex-col sm:flex-row bg-white dark:bg-black text-black dark:text-white">
        <!-- Sidebar / nav admin -->
        <aside class="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800">
            <div class="p-4 sm:p-6 flex sm:flex-col sm:h-full">
                <div class="flex items-center justify-between sm:block sm:mb-8 w-full sm:w-auto">
                    <div class="flex items-center justify-between w-full sm:w-auto">
                        <NuxtLink to="/admin" class="font-bold text-lg">
                            MiTienda <span class="text-zinc-500 font-normal">Admin</span>
                        </NuxtLink>
                        <ThemeToggle class="sm:hidden" />
                    </div>
                    <ThemeToggle class="hidden sm:block sm:mt-4" />
                </div>
                <nav class="hidden sm:flex sm:flex-col sm:gap-1 sm:flex-1">
                    <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                        class="px-3 py-2 rounded-md text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        active-class="bg-zinc-100 dark:bg-zinc-900">
                        {{ link.label }}
                    </NuxtLink>
                </nav>
                <div class="hidden sm:block sm:mt-auto sm:pt-4 sm:border-t sm:border-zinc-200 dark:sm:border-zinc-800">
                    <p class="text-sm text-zinc-500 mb-2 truncate">{{ authStore.user?.fullName }}</p>
                    <NuxtLink to="/" class="block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2">
                        ← Volver a la tienda
                    </NuxtLink>
                    <button @click="handleLogout" class="text-sm underline hover:no-underline">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </aside>

        <!-- Nav mobile (horizontal, debajo del header) -->
        <!-- Nav mobile (horizontal, debajo del header) -->
        <nav class="sm:hidden flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 px-4 gap-4">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
                class="py-3 text-sm font-medium whitespace-nowrap border-b-2 border-transparent"
                active-class="border-black dark:border-white">
                {{ link.label }}
            </NuxtLink>
            <NuxtLink to="/" class="py-3 text-sm font-medium whitespace-nowrap text-zinc-500">
                ← Tienda
            </NuxtLink>
            <button @click="handleLogout" class="py-3 text-sm font-medium whitespace-nowrap text-zinc-500">
                Cerrar sesión
            </button>
        </nav>

        <main class="flex-1 p-4 sm:p-8">
            <slot />
        </main>
    </div>
</template>