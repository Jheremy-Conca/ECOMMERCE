export type OrderStatus = 'PENDING' | 'PAID'

export interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  status: OrderStatus
  total: number
  createdAt: string
  invoiceNumber: string | null
  invoiceUrl: string | null
  items: OrderItem[]
}

interface OrderItemRaw {
  productName: string
  quantity: number
  unitPrice: string
}

interface OrderRaw {
  id: string
  status: OrderStatus
  total: string
  createdAt: string
  invoiceNumber: string | null
  invoiceUrl: string | null
  items: OrderItemRaw[]
}

interface OrdersResponse {
  success: boolean
  message: string
  data: OrderRaw[]
}

export function useOrders() {
  const api = useApi()

  async function fetchOrders(): Promise<Order[]> {
    const res = await api.apiFetch<OrdersResponse>('/orders')

    // total y unitPrice llegan como Decimal de Prisma (string en JSON)
    return res.data.map((order: OrderRaw): Order => ({
      ...order,
      total: Number(order.total),
      items: order.items.map((item: OrderItemRaw): OrderItem => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    }))
  }

  return { fetchOrders }
}