import { defineStore } from 'pinia'

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
}

interface CategoriesResponse {
  success: boolean
  message?: string
  data: Category[]
}

interface CategoryResponse {
  success: boolean
  message?: string
  data: Category
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoaded: false,
  }),

  actions: {
    async fetchCategories() {
      const { apiFetch } = useApi()
      const response = await apiFetch<CategoriesResponse>('/categories')
      this.categories = response.data
      this.isLoaded = true
    },

    async addCategory(data: { name: string }) {
      const { apiFetch } = useApi()
      const response = await apiFetch<CategoryResponse>('/categories', {
        method: 'POST',
        body: data,
      })
      this.categories.push(response.data)
    },

    async updateCategory(id: string, data: { name: string }) {
      const { apiFetch } = useApi()
      const response = await apiFetch<CategoryResponse>(`/categories/${id}`, {
        method: 'PATCH',
        body: data,
      })
      const index = this.categories.findIndex((c) => c.id === id)
      if (index !== -1) this.categories[index] = response.data
    },

    async deleteCategory(id: string) {
      const { apiFetch } = useApi()
      await apiFetch(`/categories/${id}`, { method: 'DELETE' })
      this.categories = this.categories.filter((c) => c.id !== id)
    },
  },
})