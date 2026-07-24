import { defineStore } from 'pinia'
import { mockOrders, type MockOrder, type OrderStatus } from '~/utils/mockOrders'

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        orders: [...mockOrders] as MockOrder[],
    }),

    actions: {
        updateOrderStatus(id: string, status: OrderStatus) {
            const index = this.orders.findIndex(o => o.id === id)
            const existing = this.orders[index]
            if (index === -1 || !existing) return

            this.orders[index] = { ...existing, status }
        },
    },
})