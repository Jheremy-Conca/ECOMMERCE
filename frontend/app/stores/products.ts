import { defineStore } from "pinia";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string };
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  isActive?: boolean;
}

interface ProductsListResponse {
  success: boolean;
  message?: string;
  data: {
    items: any[];
    total: number;
    page: number;
    totalPages: number;
  };
}

interface ProductResponse {
  success: boolean;
  message?: string;
  data: any;
}

function normalizeProduct(raw: any): AdminProduct {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sku: raw.sku,
    description: raw.description,
    price: Number(raw.price),
    stock: raw.stock,
    images: raw.images ?? [],
    isActive: raw.isActive,
    categoryId: raw.categoryId,
    category: raw.category
      ? { id: raw.category.id, name: raw.category.name }
      : undefined,
  };
}

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [] as AdminProduct[],
    isLoaded: false,
  }),

  actions: {
    async fetchProducts() {
      const { apiFetch } = useApi();
      const response = await apiFetch<ProductsListResponse>(
        "/products/admin?page=1&limit=100",
      );
      this.products = response.data.items.map(normalizeProduct);
      this.isLoaded = true;
    },

    async addProduct(data: ProductFormData, files?: File[]) {
      const { apiFetch } = useApi();
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      formData.append("categoryId", data.categoryId);
      formData.append("isActive", String(data.isActive ?? true));

      if (files) {
        for (const file of files) {
          formData.append("images", file);
        }
      }

      const response = await apiFetch<ProductResponse>("/products", {
        method: "POST",
        body: formData,
      });
      this.products.unshift(normalizeProduct(response.data));
    },

    // El PATCH /:id NO acepta imágenes (eso va por /:id/images aparte) — solo datos
    async updateProduct(id: string, data: ProductFormData) {
      const { apiFetch } = useApi();
      const response = await apiFetch<ProductResponse>(`/products/${id}`, {
        method: "PATCH",
        body: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          categoryId: data.categoryId,
          isActive: data.isActive,
        },
      });
      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1) this.products[index] = normalizeProduct(response.data);
    },

    async deleteProduct(id: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/products/${id}`, { method: "DELETE" });
      this.products = this.products.filter((p) => p.id !== id);
    },

    // ---- Gestión de imágenes de un producto ya existente ----

    async addProductImages(id: string, files: File[]) {
      const { apiFetch } = useApi();
      const formData = new FormData();
      for (const file of files) {
        formData.append("images", file);
      }

      const response = await apiFetch<ProductResponse>(
        `/products/${id}/images`,
        {
          method: "POST",
          body: formData,
        },
      );

      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1 && response?.data) {
        this.products[index] = normalizeProduct(response.data);
      }
    },

    async deleteProductImage(id: string, imageUrl: string) {
      const { apiFetch } = useApi();
      const response = await apiFetch<ProductResponse>(
        `/products/${id}/images`,
        {
          method: "DELETE",
          body: { imageUrl },
        },
      );

      const index = this.products.findIndex((p) => p.id === id);
      if (index === -1) return;

      const current = this.products[index];
      if (!current) return;

      if (response?.data) {
        this.products[index] = normalizeProduct(response.data);
      } else {
        this.products[index] = {
          ...current,
          images: current.images.filter((img) => img !== imageUrl),
        };
      }
    },
  },
});
