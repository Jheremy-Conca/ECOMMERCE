import { defineStore } from 'pinia'
import type { Product } from '~/utils/mockProducts'

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),

    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  },

  actions: {
    addItem(product: Product, quantity = 1) {
      const existing = this.items.find(i => i.product.id === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ product, quantity })
      }
    },

    removeItem(productId: string) {
      this.items = this.items.filter(i => i.product.id !== productId)
    },

    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(i => i.product.id === productId)
      if (item) item.quantity = quantity
    },

    clearCart() {
      this.items = []
    },
  },
})