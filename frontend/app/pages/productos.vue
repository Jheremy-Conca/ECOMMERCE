<script setup lang="ts">
import { mockProducts as mockProductsData, type Product } from '~/utils/mockProducts'

const { isLoading, error, run } = useAsyncAction()
const products = ref<Product[]>([])
const selectedCategory = ref<string>('Todas')

async function loadProducts() {
  const result = await run(() => mockProductsData, { delay: 500 })
  if (result) {
    products.value = result
  }
}

onMounted(() => {
  loadProducts()
})

const categories = computed(() => {
  const unique = new Set(products.value.map(p => p.category))
  return ['Todas', ...unique]
})

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Todas') return products.value
  return products.value.filter(p => p.category === selectedCategory.value)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Productos</h1>

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

    <template v-else>
      <div class="flex gap-2 flex-wrap mb-8">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-4 py-2 rounded-full text-sm border transition-colors',
            selectedCategory === cat
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
              : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-20 text-zinc-500">
        No hay productos en esta categoría.
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </template>
  </div>
</template>