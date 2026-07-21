<script setup lang="ts">
import { mockProducts as mockProductsData, type Product } from '~/utils/mockProducts'

const { isLoading, error, run } = useAsyncAction()
const products = ref<Product[]>([])

async function loadProducts() {
  const result = await run(() => mockProductsData, { delay: 500 })
  if (result) {
    products.value = result
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold">Bienvenido a MiTienda</h1>
    <p class="text-gray-500 mt-2 mb-8">Descubre nuestros productos.</p>

    <div v-if="isLoading" class="flex justify-center py-20">
      <Spinner size="lg" />
    </div>

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button
        @click="loadProducts"
        class="text-sm underline hover:no-underline"
      >
        Reintentar
      </button>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>