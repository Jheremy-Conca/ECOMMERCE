<script setup lang="ts">
import type { OrderStatus } from '~/stores/orders'

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
})

useSeoMeta({
    title: 'Pedidos | Admin',
    robots: 'noindex',
})

const ordersStore = useOrdersStore()

const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
    try {
        await ordersStore.fetchOrders()
    } catch (err: any) {
        loadError.value = err.message || 'Error al cargar pedidos'
    } finally {
        isLoading.value = false
    }
})

const statusOptions: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
}

const statusStyles: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const filterStatus = ref<OrderStatus | 'ALL'>('ALL')
const expandedOrderId = ref<string | null>(null)
const updatingOrderId = ref<string | null>(null)

function toggleExpanded(orderId: string) {
    expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}

const filteredOrders = computed(() => {
    if (filterStatus.value === 'ALL') return ordersStore.orders
    return ordersStore.orders.filter(o => o.status === filterStatus.value)
})

async function handleStatusChange(orderId: string, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as OrderStatus
    updatingOrderId.value = orderId
    try {
        await ordersStore.updateOrderStatus(orderId, newStatus)
    } catch (err: any) {
        alert(err.message || 'No se pudo actualizar el estado del pedido')
    } finally {
        updatingOrderId.value = null
    }
}
</script>

<template>
    <div>
        <div class="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
            <h1 class="text-2xl font-bold">Pedidos</h1>

            <select v-model="filterStatus"
                class="bg-zinc-900 text-white border border-zinc-700 rounded-md px-3 py-2 text-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-600">
                <option value="ALL" class="bg-zinc-900 text-white">Todos los estados</option>
                <option v-for="status in statusOptions" :key="status" :value="status" class="bg-zinc-900 text-white">
                    {{ statusLabels[status] }}
                </option>
            </select>
        </div>

        <p v-if="isLoading" class="text-zinc-500 text-center py-10">Cargando...</p>
        <p v-else-if="loadError" class="text-red-500 text-center py-10">{{ loadError }}</p>

        <div v-else-if="filteredOrders.length === 0" class="text-zinc-500 text-center py-10">
            No hay pedidos con este estado.
        </div>

        <div v-else class="space-y-3">
            <div v-for="order in filteredOrders" :key="order.id"
                class="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">

                <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <button type="button" @click="toggleExpanded(order.id)"
                        class="flex-1 min-w-0 flex items-center gap-2 text-left">
                        <span class="text-zinc-400 shrink-0 transition-transform"
                            :class="{ 'rotate-90': expandedOrderId === order.id }">▶</span>
                        <span class="min-w-0">
                            <p class="font-medium">{{ order.id }} · {{ order.customerName }}</p>
                            <p class="text-sm text-zinc-500">
                                {{ new Date(order.createdAt).toLocaleDateString() }} ·
                                {{ order.items.length }} {{ order.items.length === 1 ? 'producto' : 'productos' }}
                            </p>
                        </span>
                    </button>

                    <p class="font-bold shrink-0">S/ {{ order.total.toFixed(2) }}</p>

                    <span :class="['text-xs font-medium px-2 py-1 rounded-full shrink-0', statusStyles[order.status]]">
                        {{ statusLabels[order.status] }}
                    </span>

                    <select :value="order.status" :disabled="updatingOrderId === order.id"
                        @change="handleStatusChange(order.id, $event)"
                        class="bg-zinc-900 text-white border border-zinc-700 rounded-md px-3 py-2 text-sm shrink-0 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-600 disabled:opacity-50">
                        <option v-for="status in statusOptions" :key="status" :value="status"
                            class="bg-zinc-900 text-white">
                            {{ statusLabels[status] }}
                        </option>
                    </select>
                </div>

                <div v-if="expandedOrderId === order.id"
                    class="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="text-zinc-500 text-left">
                                <th class="font-normal pb-2">Producto</th>
                                <th class="font-normal pb-2 text-right">Cantidad</th>
                                <th class="font-normal pb-2 text-right">Precio unit.</th>
                                <th class="font-normal pb-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in order.items" :key="idx"
                                class="border-t border-zinc-200 dark:border-zinc-800">
                                <td class="py-2">{{ item.productName }}</td>
                                <td class="py-2 text-right">{{ item.quantity }}</td>
                                <td class="py-2 text-right">S/ {{ item.unitPrice.toFixed(2) }}</td>
                                <td class="py-2 text-right">S/ {{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>