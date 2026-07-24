<script setup lang="ts">
import type { Product } from '~/utils/mockProducts'

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
})

useSeoMeta({
    title: 'Productos | Admin',
    robots: 'noindex',
})

const productsStore = useProductsStore()

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)

const emptyForm = { name: '', description: '', price: 0, stock: 0, imageUrl: '', category: '' }
const form = reactive({ ...emptyForm })
const validationError = ref('')

function openCreate() {
    editingId.value = null
    Object.assign(form, emptyForm)
    validationError.value = ''
    isFormOpen.value = true
}

function openEdit(product: Product) {
    editingId.value = product.id
    Object.assign(form, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category,
    })
    validationError.value = ''
    isFormOpen.value = true
}

function closeForm() {
    isFormOpen.value = false
}

function handleSubmit() {
    if (!form.name.trim() || !form.category.trim()) {
        validationError.value = 'Nombre y categoría son obligatorios.'
        return
    }
    if (form.price <= 0) {
        validationError.value = 'El precio debe ser mayor a 0.'
        return
    }
    if (form.stock < 0) {
        validationError.value = 'El stock no puede ser negativo.'
        return
    }

    if (editingId.value) {
        productsStore.updateProduct(editingId.value, { ...form })
    } else {
        productsStore.addProduct({ ...form })
    }
    closeForm()
}

function handleDelete(product: Product) {
    if (confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
        productsStore.deleteProduct(product.id)
    }
}
</script>

<template>
    <div>
        <div class="flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8">
            <h1 class="text-2xl font-bold">Productos</h1>
            <button @click="openCreate"
                class="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-700">
                + Nuevo producto
            </button>
        </div>

        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">

            <!-- Formulario alta/edición -->
            <div v-if="isFormOpen" class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 mb-8">
                <h2 class="text-lg font-bold mb-4">{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</h2>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm text-zinc-500 block mb-1">Nombre</label>
                            <input v-model="form.name" type="text"
                                class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label class="text-sm text-zinc-500 block mb-1">Categoría</label>
                            <input v-model="form.category" type="text"
                                class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label class="text-sm text-zinc-500 block mb-1">Precio (S/)</label>
                            <input v-model.number="form.price" type="number" min="0" step="0.10"
                                class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                        </div>
                        <div>
                            <label class="text-sm text-zinc-500 block mb-1">Stock</label>
                            <input v-model.number="form.stock" type="number" min="0"
                                class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                        </div>
                    </div>

                    <div>
                        <label class="text-sm text-zinc-500 block mb-1">URL de imagen</label>
                        <input v-model="form.imageUrl" type="text"
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
                            {{ editingId ? 'Guardar cambios' : 'Crear producto' }}
                        </button>
                        <button type="button" @click="closeForm"
                            class="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-black dark:text-white">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>

        </Transition>

        <!-- Listado -->
        <div v-if="productsStore.products.length === 0" class="text-zinc-500 text-center py-10">
            No hay productos.
        </div>

        <div v-else class="space-y-3">
            <div v-for="product in productsStore.products" :key="product.id"
                class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <NuxtImg :src="product.imageUrl" :alt="product.name"
                    class="w-16 h-16 rounded-md object-cover shrink-0" />

                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ product.name }}</p>
                    <p class="text-sm text-zinc-500">{{ product.category }} · Stock: {{ product.stock }}</p>
                </div>

                <p class="font-bold shrink-0">S/ {{ product.price.toFixed(2) }}</p>

                <div class="flex gap-2 shrink-0">
                    <button @click="openEdit(product)" class="text-sm underline hover:no-underline">Editar</button>
                    <button @click="handleDelete(product)"
                        class="text-sm text-red-500 underline hover:no-underline">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>