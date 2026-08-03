<script setup lang="ts">
import type { AdminProduct } from '~/stores/products'

definePageMeta({
    layout: 'admin',
    middleware: 'admin',
})

useSeoMeta({
    title: 'Productos | Admin',
    robots: 'noindex',
})

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
    try {
        await Promise.all([
            productsStore.fetchProducts(),
            categoriesStore.fetchCategories(),
        ])
    } catch (err: any) {
        loadError.value = err.message || 'Error al cargar productos'
    } finally {
        isLoading.value = false
    }
})

const isFormOpen = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)

const emptyForm = { name: '', description: '', price: 0, stock: 0, categoryId: '' }
const form = reactive({ ...emptyForm })
const selectedFiles = ref<File[]>([])
const validationError = ref('')

const editingProduct = computed<AdminProduct | null>(() =>
    editingId.value ? productsStore.products.find(p => p.id === editingId.value) ?? null : null
)

// ---- Carrusel de imágenes (modo edición) ----
const activeImageIndex = ref(0)

function prevImage() {
    const total = editingProduct.value?.images.length ?? 0
    if (total === 0) return
    activeImageIndex.value = (activeImageIndex.value - 1 + total) % total
}

function nextImage() {
    const total = editingProduct.value?.images.length ?? 0
    if (total === 0) return
    activeImageIndex.value = (activeImageIndex.value + 1) % total
}
const submitButtonLabel = computed(() => {
    if (isSubmitting.value) return 'Guardando...'
    return editingId.value ? 'Guardar cambios' : 'Crear producto'
})

// Si se borra la imagen activa (o cualquiera anterior), el índice puede
// quedar fuera de rango: lo recorta al último válido.
watch(
    () => editingProduct.value?.images.length ?? 0,
    (len) => {
        if (len === 0) {
            activeImageIndex.value = 0
        } else if (activeImageIndex.value > len - 1) {
            activeImageIndex.value = len - 1
        }
    }
)

// ---- Subida/borrado de imágenes ----
const newImageFiles = ref<File[]>([])
const newImagesInput = ref<HTMLInputElement | null>(null)
const isUploadingImages = ref(false)
const deletingImage = ref<string | null>(null)
const imagesError = ref('')

function resetImagesState() {
    newImageFiles.value = []
    isUploadingImages.value = false
    deletingImage.value = null
    imagesError.value = ''
    activeImageIndex.value = 0
    if (newImagesInput.value) newImagesInput.value.value = ''
}

function openCreate() {
    editingId.value = null
    Object.assign(form, emptyForm)
    selectedFiles.value = []
    validationError.value = ''
    resetImagesState()
    isFormOpen.value = true
}

function openEdit(product: AdminProduct) {
    editingId.value = product.id
    Object.assign(form, {
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
    })
    selectedFiles.value = []
    validationError.value = ''
    resetImagesState()
    isFormOpen.value = true
}

function closeForm() {
    isFormOpen.value = false
}

function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    selectedFiles.value = input.files ? Array.from(input.files) : []
}

async function handleSubmit() {
    if (!form.name.trim() || !form.categoryId) {
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

    isSubmitting.value = true
    try {
        if (editingId.value) {
            await productsStore.updateProduct(editingId.value, { ...form })
        } else {
            await productsStore.addProduct({ ...form }, selectedFiles.value)
        }
        closeForm()
    } catch (err: any) {
        validationError.value = err.message || 'Ocurrió un error al guardar el producto'
    } finally {
        isSubmitting.value = false
    }
}

async function handleDelete(product: AdminProduct) {
    if (confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
        try {
            await productsStore.deleteProduct(product.id)
        } catch (err: any) {
            alert(err.message || 'No se pudo eliminar el producto')
        }
    }
}

function handleNewImagesChange(event: Event) {
    const input = event.target as HTMLInputElement
    newImageFiles.value = input.files ? Array.from(input.files) : []
}

const totalImagesAfterUpload = computed(
    () => (editingProduct.value?.images.length ?? 0) + newImageFiles.value.length
)

async function handleUploadImages() {
    if (!editingId.value || newImageFiles.value.length === 0) return
    if (totalImagesAfterUpload.value > 5) {
        imagesError.value = 'Máximo 5 imágenes por producto.'
        return
    }

    imagesError.value = ''
    isUploadingImages.value = true
    try {
        await productsStore.addProductImages(editingId.value, newImageFiles.value)
        newImageFiles.value = []
        if (newImagesInput.value) newImagesInput.value.value = ''
    } catch (err: any) {
        imagesError.value = err.message || 'No se pudieron subir las imágenes'
    } finally {
        isUploadingImages.value = false
    }
}

async function handleDeleteImage(imageUrl: string) {
    if (!editingId.value) return
    if (!confirm('¿Quitar esta imagen del producto?')) return

    imagesError.value = ''
    deletingImage.value = imageUrl
    try {
        await productsStore.deleteProductImage(editingId.value, imageUrl)
    } catch (err: any) {
        imagesError.value = err.message || 'No se pudo quitar la imagen'
    } finally {
        deletingImage.value = null
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

            <div v-if="isFormOpen" class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 sm:p-6 mb-8">
                <h2 class="text-lg font-bold mb-4">{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</h2>

                <form @submit.prevent="handleSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                        <!-- Columna izquierda: datos del producto -->
                        <div class="space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm text-zinc-500 block mb-1">Nombre</label>
                                    <input v-model="form.name" type="text"
                                        class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2" />
                                </div>
                                <div>
                                    <label class="text-sm text-zinc-500 block mb-1">Categoría</label>
                                    <select v-model="form.categoryId"
                                        class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2">
                                        <option value="" disabled class="bg-white text-black">Selecciona una categoría
                                        </option>
                                        <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id"
                                            class="bg-white text-black">
                                            {{ cat.name }}
                                        </option>
                                    </select>
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
                                <label class="text-sm text-zinc-500 block mb-1">Descripción</label>
                                <textarea v-model="form.description" rows="4"
                                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2"></textarea>
                            </div>

                            <!-- Al crear, todavía no hay nada que mostrar en el carrusel:
                                 el selector de archivos simple se queda aquí -->
                            <div v-if="!editingId">
                                <label class="text-sm text-zinc-500 block mb-1">Imágenes (máx. 5, jpg/png/webp, 5MB
                                    c/u)</label>
                                <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                                    @change="handleFileChange"
                                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-md px-3 py-2 text-sm" />
                                <p v-if="selectedFiles.length" class="text-xs text-zinc-500 mt-1">
                                    {{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'archivo seleccionado' :
                                        'archivos seleccionados' }}
                                </p>
                            </div>

                            <p v-if="validationError" class="text-red-500 text-sm">{{ validationError }}</p>

                            <div class="flex gap-3">
                                <button type="submit" :disabled="isSubmitting"
                                    class="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-700 disabled:opacity-50">
                                    {{ submitButtonLabel }}
                                </button>
                                <button type="button" @click="closeForm"
                                    class="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm font-medium text-black dark:text-white">
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <!-- Columna derecha: carrusel de imágenes (solo edición) -->
                        <div v-if="editingId" class="space-y-3">
                            <label class="text-sm text-zinc-500 block">
                                Imágenes ({{ editingProduct?.images.length ?? 0 }}/5)
                            </label>

                            <p v-if="imagesError" class="text-red-500 text-xs">{{ imagesError }}</p>

                            <div v-if="editingProduct?.images.length"
                                class="relative w-full aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                                <NuxtImg :src="editingProduct.images[activeImageIndex]" :alt="editingProduct.name"
                                    sizes="300px" class="w-full h-full object-contain p-3" />

                                <template v-if="editingProduct.images.length > 1">
                                    <button type="button" @click="prevImage"
                                        class="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                                        ‹
                                    </button>
                                    <button type="button" @click="nextImage"
                                        class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                                        ›
                                    </button>
                                </template>

                                <button type="button"
                                    @click="handleDeleteImage(editingProduct.images[activeImageIndex])"
                                    :disabled="deletingImage === editingProduct.images[activeImageIndex]"
                                    class="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 disabled:opacity-50 shadow"
                                    title="Quitar esta imagen">
                                    <span v-if="deletingImage === editingProduct.images[activeImageIndex]"
                                        class="animate-spin">⟳</span>
                                    <span v-else>✕</span>
                                </button>

                                <div v-if="editingProduct.images.length > 1"
                                    class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    <button v-for="(img, i) in editingProduct.images" :key="img" type="button"
                                        @click="activeImageIndex = i" class="w-1.5 h-1.5 rounded-full transition-colors"
                                        :class="i === activeImageIndex ? 'bg-white' : 'bg-white/40'" />
                                </div>
                            </div>

                            <div v-else
                                class="w-full aspect-square rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-500 text-center px-4">
                                Este producto no tiene imágenes todavía.
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                <input ref="newImagesInput" type="file" accept="image/jpeg,image/png,image/webp"
                                    multiple @change="handleNewImagesChange" class="hidden" />
                                <button type="button" @click="newImagesInput?.click()"
                                    class="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-md text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    + Elegir imágenes
                                </button>
                                <button v-if="newImageFiles.length" type="button" @click="handleUploadImages"
                                    :disabled="isUploadingImages || totalImagesAfterUpload > 5"
                                    class="px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-700 disabled:opacity-50">
                                    {{ isUploadingImages ? 'Subiendo...' : `Subir (${newImageFiles.length})` }}
                                </button>
                            </div>
                            <p v-if="totalImagesAfterUpload > 5" class="text-xs text-red-500">
                                Máximo 5 imágenes por producto.
                            </p>
                        </div>
                    </div>
                </form>
            </div>

        </Transition>

        <p v-if="isLoading" class="text-zinc-500 text-center py-10">Cargando...</p>
        <p v-else-if="loadError" class="text-red-500 text-center py-10">{{ loadError }}</p>

        <div v-else-if="productsStore.products.length === 0" class="text-zinc-500 text-center py-10">
            No hay productos.
        </div>

        <div v-else class="space-y-3">
            <div v-for="product in productsStore.products" :key="product.id"
                class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <NuxtImg v-if="product.images[0]" :src="product.images[0]" :alt="product.name"
                    class="w-16 h-16 rounded-md object-cover shrink-0" />
                <div v-else class="w-16 h-16 rounded-md bg-zinc-100 dark:bg-zinc-800 shrink-0" />

                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ product.name }}</p>
                    <p class="text-sm text-zinc-500">
                        {{ product.category?.name ?? 'Sin categoría' }} · Stock: {{ product.stock }}
                        <span v-if="!product.isActive" class="text-red-500">· Inactivo</span>
                    </p>
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