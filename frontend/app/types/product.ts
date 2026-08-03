export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  price: number
  stock: number
  isActive: boolean
  images: string[]
  category: ProductCategory
}