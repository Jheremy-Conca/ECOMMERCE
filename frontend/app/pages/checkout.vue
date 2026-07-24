<script setup lang="ts">
const cartStore = useCartStore()
const router = useRouter()

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Checkout',
  description: 'Completa tus datos de envío para finalizar tu compra.',
  robots: 'noindex',
})

const form = reactive({
  fullName: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
})

const validationError = ref('')
const orderConfirmed = ref(false)
const { isLoading, error: submitError, run } = useAsyncAction()

async function submitOrder() {
  validationError.value = ''

  if (!form.fullName || !form.street || !form.city || !form.state || !form.zipCode || !form.country || !form.phone) {
    validationError.value = 'Completa todos los campos.'
    return
  }

  const result = await run(() => {
    cartStore.clearCart()
    return true
  }, { delay: 900 })

  if (result) {
    orderConfirmed.value = true
    const { showToast } = useToast()
    showToast('Pedido confirmado con éxito')
  }
}

function goHome() {
  router.push('/')
}

</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-10">
    <div v-if="orderConfirmed" class="text-center py-20">
      <p class="text-2xl font-bold mb-4">¡Pedido confirmado! 🎉</p>
      <p class="text-zinc-500 mb-6">Te contactaremos pronto para coordinar la entrega.</p>
      <button @click="goHome"
        class="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
        Volver al inicio
      </button>
    </div>

    <div v-else-if="cartStore.items.length === 0" class="text-center py-20">
      <p class="text-zinc-500">Tu carrito está vacío.</p>
      <NuxtLink to="/" class="text-blue-400 underline mt-2 inline-block">
        Ver productos
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="submitOrder" class="grid md:grid-cols-2 gap-10">
      <div class="space-y-4">
        <h1 class="text-2xl font-bold mb-2">Datos de envío</h1>

        <div>
          <label class="block text-sm mb-1">Nombre completo</label>
          <input v-model="form.fullName" type="text" required :disabled="isLoading"
            class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
        </div>

        <div>
          <label class="block text-sm mb-1">Dirección</label>
          <input v-model="form.street" type="text" required :disabled="isLoading"
            class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Ciudad</label>
            <input v-model="form.city" type="text" required :disabled="isLoading"
              class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
          </div>

          <div>
            <label class="block text-sm mb-1">Departamento / Estado</label>
            <input v-model="form.state" type="text" required :disabled="isLoading"
              class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Código postal</label>
            <input v-model="form.zipCode" type="text" required :disabled="isLoading"
              class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
          </div>

          <div>
            <label class="block text-sm mb-1">País</label>
            <input v-model="form.country" type="text" required :disabled="isLoading"
              class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
          </div>
        </div>

        <div>
          <label class="block text-sm mb-1">Teléfono</label>
          <input v-model="form.phone" type="tel" required :disabled="isLoading"
            class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-6">Resumen del pedido</h2>

        <div class="space-y-3 mb-6">
          <div v-for="item in cartStore.items" :key="item.product.id" class="flex justify-between text-sm">
            <span class="text-zinc-600 dark:text-zinc-400">
              {{ item.product.name }} x{{ item.quantity }}
            </span>
            <span class="font-medium">
              S/ {{ (item.product.price * item.quantity).toFixed(2) }}
            </span>
          </div>
        </div>

        <div class="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between font-bold text-lg mb-6">
          <span>Total</span>
          <span>S/ {{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>

        <p v-if="validationError" class="text-red-500 text-sm mb-3">{{ validationError }}</p>
        <p v-if="submitError" class="text-red-500 text-sm mb-3">{{ submitError }}</p>

        <button type="submit" :disabled="isLoading"
          class="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
          <Spinner v-if="isLoading" size="sm" />
          {{ isLoading ? 'Procesando pedido...' : 'Confirmar pedido' }}
        </button>
      </div>
    </form>
  </div>
</template>