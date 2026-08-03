import { defineStore } from 'pinia'

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface AdminOrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface AdminOrder {
  id: string
  status: OrderStatus
  total: number
  createdAt: string
  customerName: string
  invoiceNumber: string | null
  invoiceUrl: string | null
  items: AdminOrderItem[]
}

interface OrdersResponse {
  success: boolean
  message?: string
  data: any[]
}

interface OrderResponse {
  success: boolean
  message?: string
  data: any
}

function normalizeOrder(raw: any): AdminOrder {
  return {
    id: raw.id,
    status: raw.status,
    total: Number(raw.total),
    createdAt: raw.createdAt,
    customerName: raw.customerName,
    invoiceNumber: raw.invoiceNumber,
    invoiceUrl: raw.invoiceUrl,
    items: raw.items.map((item: any) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
  }
}

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as AdminOrder[],
    isLoaded: false,
  }),

  actions: {
    async fetchOrders() {
      const { apiFetch } = useApi()
      const response = await apiFetch<OrdersResponse>('/orders/admin')
      this.orders = response.data.map(normalizeOrder)
      this.isLoaded = true
    },

    async updateOrderStatus(id: string, status: OrderStatus) {
      const { apiFetch } = useApi()
      const response = await apiFetch<OrderResponse>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      const updated = normalizeOrder(response.data)
      const index = this.orders.findIndex((o) => o.id === id)
      if (index !== -1) this.orders[index] = updated
    },
  },
})