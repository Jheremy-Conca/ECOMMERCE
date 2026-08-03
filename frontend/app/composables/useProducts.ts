import type { Product } from '~/types/product'

interface ProductsListResponse {
  success: boolean
  message?: string
  data: {
    items: Product[]
    total: number
    page: number
    totalPages: number
  }
}

// Estado compartido entre productos.vue y productos/[slug].vue:
// se carga una vez y ambas páginas leen del mismo cache.
const products = ref<Product[]>([])
const isLoaded = ref(false)

export function useProducts() {
  const { apiFetch } = useApi()

  async function fetchProducts() {
    const response = await apiFetch<ProductsListResponse>('/products?page=1&limit=100')
    products.value = response.data.items.map(p => ({ ...p, price: Number(p.price) }))
    isLoaded.value = true
    return products.value
  }

  function getBySlug(slug: string) {
    return products.value.find(p => p.slug === slug)
  }

  return { products, isLoaded, fetchProducts, getBySlug }
}