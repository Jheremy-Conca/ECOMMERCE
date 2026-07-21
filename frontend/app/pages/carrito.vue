<script setup lang="ts">
const cartStore = useCartStore()
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-8">Mi carrito</h1>

    <div v-if="cartStore.items.length === 0" class="text-center py-20">
      <p class="text-zinc-500">Tu carrito está vacío.</p>
      <NuxtLink to="/" class="text-blue-400 underline mt-2 inline-block">
        Ver productos
      </NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in cartStore.items" :key="item.product.id"
        class="flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <img :src="item.product.imageUrl" :alt="item.product.name"
          class="w-20 h-20 flex-shrink-0 object-cover rounded" />

        <div class="flex-1 min-w-0">
          <h3 class="font-medium truncate">{{ item.product.name }}</h3>
          <p class="text-zinc-500 text-sm">S/ {{ item.product.price.toFixed(2) }}</p>
        </div>

        <input type="number" min="1" :value="item.quantity"
          @change="cartStore.updateQuantity(item.product.id, Number(($event.target as HTMLInputElement).value))"
          class="w-16 flex-shrink-0 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-2 py-1 text-center" />

        <p class="w-24 flex-shrink-0 text-right font-medium">
          S/ {{ (item.product.price * item.quantity).toFixed(2) }}
        </p>

        <button @click="cartStore.removeItem(item.product.id)"
          class="flex-shrink-0 text-red-500 hover:text-red-400 text-sm">
          Quitar
        </button>
      </div>

      <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex justify-between items-center">
        <p class="text-lg font-bold">
          Total: S/ {{ cartStore.totalPrice.toFixed(2) }}
        </p>

        <NuxtLink to="/checkout"
          class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Ir a pagar
        </NuxtLink>
      </div>
    </div>
  </div>
</template>