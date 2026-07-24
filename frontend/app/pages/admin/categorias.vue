<script setup lang="ts">
import type { Category } from '~/utils/mockCategories'

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
})

useSeoMeta({
    title: 'Categorías | Admin',
    robots: 'noindex',
})

const categoriesStore = useCategoriesStore()

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = { name: '', description: '' }
const form = reactive({ ...emptyForm })
const validationError = ref('')

function openCreate() {
    editingId.value = null
    Object.assign(form, emptyForm)
    validationError.value = ''
    isFormOpen.value = true
}

function openEdit(category: Category) {
    editingId.value = category.id
    Object.assign(form, {
        name: category.name,
        description: category.description,
    })
    validationError.value = ''
    isFormOpen.value = true
}

function closeForm() {
    isFormOpen.value = false
}

function handleSubmit() {
    if (!form.name.trim()) {
        validationError.value = 'El nombre es obligatorio.'
        return
    }

    if (editingId.value) {
        categoriesStore.updateCategory(editingId.value, { ...form })
    } else {
        categoriesStore.addCategory({ ...form })
    }
    closeForm()
}

function handleDelete(category: Category) {
    if (confirm(`¿Eliminar "${category.name}"? Esta acción no se puede deshacer.`)) {
        categoriesStore.deleteCategory(category.id)
    }
}
</script>

<template>
    <div>
        <div class="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
            <h1 class="text-2xl font-bold">Categorías</h1>
            <button @click="openCreate"
                class="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-700">
                + Nueva categoría
            </button>
        </div>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div v-if="isFormOpen" class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 mb-8">
                <h2 class="text-lg font-bold mb-4">{{ editingId ? 'Editar categoría' : 'Nueva categoría' }}</h2>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div>
                        <label class="text-sm text-zinc-500 block mb-1">Nombre</label>
                        <input v-model="form.name" type="text"
                            class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                    </div>

                    <div>
                        <label class="text-sm text-zinc-500 block mb-1">Descripción</label>
                        <textarea v-model="form.description" rows="3"
                            class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2"></textarea>
                    </div>

                    <p v-if="validationError" class="text-red-500 text-sm">{{ validationError }}</p>

                    <div class="flex gap-3">
                        <button type="submit"
                            class="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-700">
                            {{ editingId ? 'Guardar cambios' : 'Crear categoría' }}
                        </button>
                        <button type="button" @click="closeForm"
                            class="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-black dark:text-white">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </Transition>

        <div v-if="categoriesStore.categories.length === 0" class="text-zinc-500 text-center py-10">
            No hay categorías.
        </div>

        <div v-else class="space-y-3">
            <div v-for="category in categoriesStore.categories" :key="category.id"
                class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex items-center gap-4">
                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ category.name }}</p>
                    <p class="text-sm text-zinc-500 truncate">{{ category.description }}</p>
                </div>

                <div class="flex gap-2 shrink-0">
                    <button @click="openEdit(category)" class="text-sm underline hover:no-underline">Editar</button>
                    <button @click="handleDelete(category)"
                        class="text-sm text-red-500 underline hover:no-underline">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>