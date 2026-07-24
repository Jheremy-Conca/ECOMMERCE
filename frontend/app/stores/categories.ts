import { defineStore } from "pinia";
import { mockCategories, type Category } from "~/utils/mockCategories";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [...mockCategories] as Category[],
  }),

  actions: {
    addCategory(category: Omit<Category, "id">) {
      const newCategory: Category = {
        ...category,
        id: crypto.randomUUID(),
      };
      this.categories.push(newCategory);
    },

    updateCategory(id: string, changes: Omit<Category, "id">) {
      const index = this.categories.findIndex((c) => c.id === id);
      const existing = this.categories[index];
      if (index === -1 || !existing) return;

      this.categories[index] = { ...existing, ...changes };
    },

    deleteCategory(id: string) {
      this.categories = this.categories.filter((c) => c.id !== id);
    },
  },
});
