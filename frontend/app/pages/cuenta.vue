<script setup lang="ts">
import { mockOrders as mockOrdersData, type MockOrder, type OrderStatus } from '~/utils/mockOrders'
const authStore = useAuthStore()

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Mi cuenta',
  description: 'Consulta tus datos personales y el historial de tus pedidos.',
  robots: 'noindex',
})

const { isLoading, error, run } = useAsyncAction()
const orders = ref<MockOrder[]>([])

async function loadOrders() {
  const result = await run(() => mockOrdersData, { delay: 500 })
  if (result) {
    orders.value = result.filter(order => order.customerEmail === authStore.user?.email)
  }
}

onMounted(() => {
  loadOrders()
})

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-500',
  PAID: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-purple-500/20 text-purple-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}
</script>

<template>
  <div v-if="authStore.user" class="max-w-4xl mx-auto px-4 py-6 sm:py-10">
    <h1 class="text-2xl font-bold mb-6 sm:mb-8">Mi cuenta</h1>

    <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 mb-8 sm:mb-10">
      <h2 class="text-lg font-bold mb-4">Datos personales</h2>
      <p class="text-sm text-zinc-500">Nombre</p>
      <p class="mb-3">{{ authStore.user.fullName }}</p>
      <p class="text-sm text-zinc-500">Correo</p>
      <p>{{ authStore.user.email }}</p>
    </div>

    <h2 class="text-lg font-bold mb-4">Historial de pedidos</h2>

    <div v-if="isLoading" class="flex justify-center py-10">
      <Spinner size="lg" />
    </div>

    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button @click="loadOrders" class="text-sm underline hover:no-underline">
        Reintentar
      </button>
    </div>

    <div v-else-if="orders.length === 0" class="text-zinc-500 text-center py-10">
      Aún no tienes pedidos.
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id"
        class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-5">
        <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
          <div class="min-w-0">
            <p class="font-medium truncate">{{ order.id }}</p>
            <p class="text-sm text-zinc-500">{{ order.createdAt }}</p>
          </div>

          <span :class="['px-3 py-1 rounded-full text-xs font-medium shrink-0', statusColors[order.status]]">
            {{ statusLabels[order.status] }}
          </span>
        </div>

        <div class="space-y-1 mb-3">
          <div v-for="(item, i) in order.items" :key="i"
            class="flex justify-between gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span class="truncate min-w-0">{{ item.productName }} x{{ item.quantity }}</span>
            <span class="shrink-0">S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>S/ {{ order.total.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>