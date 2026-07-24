export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface MockOrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface MockOrder {
  id: string
  customerName: string
  createdAt: string
  status: OrderStatus
  total: number
  items: MockOrderItem[]
}

export interface MockOrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

export interface MockOrder {
  id: string
  customerName: string
  customerEmail: string
  createdAt: string
  status: OrderStatus
  total: number
  items: MockOrderItem[]
}

export const mockOrders: MockOrder[] = [
  {
    id: 'ORD-1001',
    customerName: 'Lucía Fernández',
    customerEmail: 'concajheremy@gmail.com',
    createdAt: '2026-07-15',
    status: 'DELIVERED',
    total: 379.80,
    items: [
      { productName: 'Zapatillas Urbanas Negras', quantity: 2, unitPrice: 189.90 },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Diego Ramírez',
    customerEmail: 'diego.ramirez@example.com',
    createdAt: '2026-07-18',
    status: 'SHIPPED',
    total: 149.70,
    items: [
      { productName: 'Polo Básico Blanco', quantity: 3, unitPrice: 49.90 },
    ],
  },
  {
    id: 'ORD-1003',
    customerName: 'Valeria Torres',
    customerEmail: 'concajheremy@gmail.com',
    createdAt: '2026-07-20',
    status: 'PENDING',
    total: 229.80,
    items: [
      { productName: 'Mochila Antirrobo', quantity: 1, unitPrice: 129.90 },
      { productName: 'Reloj Deportivo', quantity: 1, unitPrice: 99.90 },
    ],
  },
]