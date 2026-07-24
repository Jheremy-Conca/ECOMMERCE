<script setup lang="ts">
import { mockProducts } from '~/utils/mockProducts'
import { mockOrders } from '~/utils/mockOrders'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

useSeoMeta({
  title: 'Panel admin',
  robots: 'noindex',
})

const totalProducts = computed(() => mockProducts.length)
const lowStockCount = computed(() => mockProducts.filter(p => p.stock <= 10).length)
const pendingOrdersCount = computed(() => mockOrders.filter(o => o.status === 'PENDING').length)
const totalRevenue = computed(() =>
  mockOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0)
)

const stats = computed(() => [
  { label: 'Productos', value: totalProducts.value, to: '/admin/productos' },
  { label: 'Stock bajo (≤10)', value: lowStockCount.value, to: '/admin/productos' },
  { label: 'Pedidos pendientes', value: pendingOrdersCount.value, to: '/admin/pedidos' },
  { label: 'Total vendido', value: `S/ ${totalRevenue.value.toFixed(2)}`, to: '/admin/pedidos' },
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 sm:mb-8">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
      >
        <p class="text-sm text-zinc-500 mb-1">{{ stat.label }}</p>
        <p class="text-2xl font-bold">{{ stat.value }}</p>
      </NuxtLink>
    </div>
  </div>
</template>