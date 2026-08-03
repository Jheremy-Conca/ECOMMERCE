<script setup lang="ts">
useSeoMeta({
  title: 'Mi carrito',
  description: 'Revisa los productos en tu carrito antes de pagar.',
  robots: 'noindex',
})

const cartStore = useCartStore()
const { isLoading, error, run } = useAsyncAction()

onMounted(() => {
  run(() => cartStore.fetchCart())
})

function updateQuantity(productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) return
  run(() => cartStore.updateQuantity(productId, quantity))
}

function removeItem(productId: string) {
  run(() => cartStore.removeItem(productId))
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-8">Mi carrito</h1>

    <div v-if="isLoading && !cartStore.isLoaded" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="run(() => cartStore.fetchCart())" class="text-sm underline hover:no-underline">
        Reintentar
      </button>
    </div>

    <div v-else-if="cartStore.items.length === 0" class="text-center py-20">
      <p class="text-zinc-500">Tu carrito está vacío.</p>
      <NuxtLink to="/" class="text-blue-400 underline mt-2 inline-block">
        Ver productos
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in cartStore.items" :key="item.id"
        class="flex flex-col sm:flex-row sm:items-center gap-4 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">

        <div class="flex items-center gap-4">
          <img :src="item.product.images[0] ?? '/apple-touch-icon.png'" :alt="item.product.name"
            class="w-20 h-20 flex-shrink-0 object-cover rounded" />

          <div class="flex-1 min-w-0 sm:hidden">
            <h3 class="font-medium truncate">{{ item.product.name }}</h3>
            <p class="text-zinc-500 text-sm">S/ {{ item.product.price.toFixed(2) }}</p>
          </div>
        </div>

        <div class="flex-1 min-w-0 hidden sm:block">
          <h3 class="font-medium truncate">{{ item.product.name }}</h3>
          <p class="text-zinc-500 text-sm">S/ {{ item.product.price.toFixed(2) }}</p>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-4">
          <input type="number" min="1" :max="item.product.stock" :value="item.quantity" :disabled="isLoading"
            @change="updateQuantity(item.productId, Number(($event.target as HTMLInputElement).value))"
            class="w-16 flex-shrink-0 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-2 py-2 text-center disabled:opacity-50" />

          <p class="w-24 flex-shrink-0 text-right font-medium">
            S/ {{ (item.product.price * item.quantity).toFixed(2) }}
          </p>

          <button @click="removeItem(item.productId)" :disabled="isLoading"
            class="flex-shrink-0 text-red-500 hover:text-red-400 text-sm px-2 py-2 disabled:opacity-50">
            Quitar
          </button>
        </div>
      </div>

      <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <p class="text-lg font-bold">
          Total: S/ {{ cartStore.total.toFixed(2) }}
        </p>

        <NuxtLink to="/checkout"
          class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-center">
          Ir a pagar
        </NuxtLink>
      </div>
    </div>
  </div>
</template>