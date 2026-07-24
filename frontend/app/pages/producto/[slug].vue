<script setup lang="ts">
import { mockProducts } from '~/utils/mockProducts'

const route = useRoute()
const cartStore = useCartStore()

const product = computed(() =>
  mockProducts.find(p => p.slug === route.params.slug)
)

useSeoMeta({
  title: () => product.value ? product.value.name : 'Producto no encontrado',
  description: () => product.value
    ? product.value.description.slice(0, 160)
    : 'El producto que buscas no está disponible.',
  ogTitle: () => product.value ? `${product.value.name} | Mi Tienda` : 'Producto no encontrado',
  ogDescription: () => product.value
    ? product.value.description.slice(0, 160)
    : 'El producto que buscas no está disponible.',
  ogImage: () => product.value?.imageUrl ?? '/apple-touch-icon.png',
  ogType: 'website',
  twitterCard: () => product.value ? 'summary_large_image' : 'summary',
  twitterTitle: () => product.value ? `${product.value.name} | Mi Tienda` : 'Producto no encontrado',
  twitterDescription: () => product.value
    ? product.value.description.slice(0, 160)
    : 'El producto que buscas no está disponible.',
  twitterImage: () => product.value?.imageUrl ?? '/apple-touch-icon.png',
  robots: () => product.value ? 'index, follow' : 'noindex, nofollow',
})

const quantity = ref(1)

watch(quantity, (val) => {
  if (!product.value) return
  if (!Number.isInteger(val) || val < 1) {
    quantity.value = 1
  } else if (val > product.value.stock) {
    quantity.value = product.value.stock
  }
})
const { isLoading, run } = useAsyncAction()

async function addToCart() {
  if (!product.value) return

  const result = await run(() => {
    cartStore.addItem(product.value!, quantity.value)
    return true
  }, { delay: 400 })

  if (result) {
    const { showToast } = useToast()
    showToast(`${product.value.name} agregado al carrito`)
  }
}
</script>

<template>
  <div v-if="product" class="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 md:gap-10">
    <img :src="product.imageUrl" :alt="product.name" class="w-full aspect-square object-cover rounded-lg" />

    <div>
      <p class="text-sm text-zinc-500 mb-2">{{ product.category }}</p>
      <h1 class="text-2xl font-bold mb-4">{{ product.name }}</h1>
      <p class="text-zinc-600 dark:text-zinc-400 mb-6">{{ product.description }}</p>

      <p class="text-2xl font-bold mb-2">S/ {{ product.price.toFixed(2) }}</p>
      <p class="text-sm text-zinc-500 mb-6">
        {{ product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock' }}
      </p>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <div
          class="flex items-center justify-between border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden w-full sm:w-32">
          <button type="button" @click="quantity = Math.max(1, quantity - 1)" :disabled="isLoading || quantity <= 1"
            class="px-4 py-2 disabled:opacity-40">
            −
          </button>
          <input type="number" min="1" :max="product.stock" v-model.number="quantity" :disabled="isLoading"
            class="w-full text-center bg-transparent focus:outline-none disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <button type="button" @click="quantity = Math.min(product.stock, quantity + 1)"
            :disabled="isLoading || quantity >= product.stock" class="px-4 py-2 disabled:opacity-40">
            +
          </button>
        </div>

        <button @click="addToCart" :disabled="product.stock === 0 || isLoading"
          class="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
          <Spinner v-if="isLoading" size="sm" />
          {{ isLoading ? 'Agregando...' : 'Agregar al carrito' }}
        </button>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20">
    <p class="text-zinc-500">Producto no encontrado.</p>
    <NuxtLink to="/productos" class="text-blue-400 underline mt-2 inline-block">
      Volver a productos
    </NuxtLink>
  </div>
</template>