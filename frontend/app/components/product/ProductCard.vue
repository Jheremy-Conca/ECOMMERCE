<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/productos/${product.slug}`"
    class="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
  >
    <div class="aspect-square overflow-hidden bg-gray-100">
      <img
        :src="product.images[0] ?? '/apple-touch-icon.png'"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>

    <div class="p-4">
      <p class="text-xs text-gray-400 uppercase tracking-wide">{{ product.category.name }}</p>
      <h3 class="font-medium mt-1 line-clamp-1">{{ product.name }}</h3>
      <p class="text-lg font-bold mt-2">S/ {{ product.price.toFixed(2) }}</p>
    </div>
  </NuxtLink>
</template>