import { defineStore } from 'pinia'
import { mockProducts, type Product } from '~/utils/mockProducts'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [...mockProducts] as Product[],
  }),
  actions: {
    addProduct(data: Omit<Product, 'id' | 'slug'>) {
      this.products.push({
        id: crypto.randomUUID(),
        slug: slugify(data.name),
        ...data,
      })
    },
    updateProduct(id: string, data: Omit<Product, 'id' | 'slug'>) {
      const index = this.products.findIndex(p => p.id === id)
      if (index === -1) return
      this.products[index] = { id, slug: slugify(data.name), ...data }
    },
    deleteProduct(id: string) {
      this.products = this.products.filter(p => p.id !== id)
    },
  },
})