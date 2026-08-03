import { defineStore } from 'pinia'
import type { Product } from '~/types/product'

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
}

interface CartData {
  id: string
  userId: string
  items: CartItem[]
  total: number
}

interface CartResponse {
  success: boolean
  message?: string
  data: CartData
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    total: 0,
    isLoaded: false,
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    setFromCart(cart: CartData) {
      this.items = cart.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      }))
      this.total = Number(cart.total)
      this.isLoaded = true
    },

    async fetchCart() {
      const { apiFetch } = useApi()
      const response = await apiFetch<CartResponse>('/cart')
      this.setFromCart(response.data)
    },

    async addItem(productId: string, quantity = 1) {
      const { apiFetch } = useApi()
      const response = await apiFetch<CartResponse>('/cart/items', {
        method: 'POST',
        body: { productId, quantity },
      })
      this.setFromCart(response.data)
    },

    async updateQuantity(productId: string, quantity: number) {
      const { apiFetch } = useApi()
      const response = await apiFetch<CartResponse>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: { quantity },
      })
      this.setFromCart(response.data)
    },

    async removeItem(productId: string) {
      const { apiFetch } = useApi()
      const response = await apiFetch<CartResponse>(`/cart/items/${productId}`, {
        method: 'DELETE',
      })
      this.setFromCart(response.data)
    },

    async clearCart() {
      const { apiFetch } = useApi()
      const response = await apiFetch<CartResponse>('/cart', {
        method: 'DELETE',
      })
      this.setFromCart(response.data)
    },
  },
})