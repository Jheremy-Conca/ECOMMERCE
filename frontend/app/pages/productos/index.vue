<script setup lang="ts">
useSeoMeta({
  title: 'Productos',
  description: 'Explora todo nuestro catálogo de productos por categoría.',
  ogTitle: 'Productos | Mi Tienda',
  ogDescription: 'Explora todo nuestro catálogo de productos por categoría.',
  ogImage: '/apple-touch-icon.png',
  ogType: 'website',
  twitterCard: 'summary',
  twitterTitle: 'Productos | Mi Tienda',
  twitterDescription: 'Explora todo nuestro catálogo de productos por categoría.',
  twitterImage: '/apple-touch-icon.png',
})

const { isLoading, error, run } = useAsyncAction()
const { products, fetchProducts } = useProducts()
const selectedCategory = ref<string>('Todas')

async function loadProducts() {
  await run(() => fetchProducts())
}

onMounted(() => {
  loadProducts()
})

const categories = computed(() => {
  const unique = new Map<string, string>()
  for (const p of products.value) {
    unique.set(p.category.id, p.category.name)
  }
  return [{ id: 'Todas', name: 'Todas' }, ...Array.from(unique, ([id, name]) => ({ id, name }))]
})

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'Todas') return products.value
  return products.value.filter(p => p.category.id === selectedCategory.value)
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
      <button @click="loadProducts" class="text-sm underline hover:no-underline">
        Reintentar
      </button>
    </div>

    <template v-else>
      <div class="flex gap-2 flex-wrap mb-8">
        <button v-for="cat in categories" :key="cat.id" @click="selectedCategory = cat.id" :class="[
          'px-4 py-2 rounded-full text-sm border transition-colors',
          selectedCategory === cat.id
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
            : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        ]">
          {{ cat.name }}
        </button>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-20 text-zinc-500">
        No hay productos en esta categoría.
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
      </div>
    </template>
  </div>
</template>