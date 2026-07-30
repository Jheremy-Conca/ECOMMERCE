<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Finalizar compra</h1>

    <div class="mb-8 border border-black/10 dark:border-white/10 rounded-lg p-4">
      <h2 class="font-semibold mb-3">Resumen del pedido</h2>
      <ul class="space-y-2">
        <li
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex justify-between text-sm"
        >
          <span>{{ item.product.name }} x{{ item.quantity }}</span>
          <span>S/ {{ (item.product.price * item.quantity).toFixed(2) }}</span>
        </li>
      </ul>
      <div class="border-t border-black/10 dark:border-white/10 mt-3 pt-3 flex justify-between font-semibold">
        <span>Total</span>
        <span>S/ {{ cartStore.total.toFixed(2) }}</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <h2 class="font-semibold mb-4">Dirección de envío</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label for="street" class="block text-sm text-black/50 dark:text-white/60 mb-1.5">Calle</label>
            <input
              id="street"
              v-model="form.street"
              placeholder="Av. Ejemplo 123"
              required
              :class="inputClass"
            />
          </div>

          <div>
            <label for="country" class="block text-sm text-black/50 dark:text-white/60 mb-1.5">País</label>
            <div class="relative">
              <select
                id="country"
                v-model="selectedCountry"
                required
                :class="selectClass"
                @change="onCountryChange"
              >
                <option value="" disabled class="bg-white text-black">Selecciona un país</option>
                <option v-for="c in countries" :key="c" :value="c" class="bg-white text-black">{{ c }}</option>
              </select>
              <ChevronIcon />
            </div>
            <input
              v-if="selectedCountry === 'Otro'"
              v-model="customCountry"
              placeholder="Escribe el nombre del país"
              required
              :class="[inputClass, 'mt-2']"
            />
          </div>

          <div>
            <label for="state" class="block text-sm text-black/50 dark:text-white/60 mb-1.5">Región / Estado</label>
            <div v-if="isPeru" class="relative">
              <select
                id="state"
                v-model="form.state"
                required
                :class="selectClass"
                @change="onRegionChange"
              >
                <option value="" disabled class="bg-white text-black">Selecciona una región</option>
                <option v-for="r in regionNames" :key="r" :value="r" class="bg-white text-black">{{ r }}</option>
              </select>
              <ChevronIcon />
            </div>
            <input
              v-else
              id="state"
              v-model="form.state"
              placeholder="Región / Estado"
              required
              :class="inputClass"
            />
          </div>

          <div>
            <label for="city" class="block text-sm text-black/50 dark:text-white/60 mb-1.5">Ciudad</label>
            <div v-if="isPeru" class="relative">
              <select
                id="city"
                v-model="form.city"
                required
                :disabled="!form.state"
                :class="selectClass"
              >
                <option value="" disabled class="bg-white text-black">
                  {{ form.state ? 'Selecciona una ciudad' : 'Primero elige una región' }}
                </option>
                <option v-for="c in citiesForSelectedRegion" :key="c" :value="c" class="bg-white text-black">{{ c }}</option>
              </select>
              <ChevronIcon />
            </div>
            <input
              v-else
              id="city"
              v-model="form.city"
              placeholder="Ciudad"
              required
              :class="inputClass"
            />
          </div>

          <div>
            <label for="zipCode" class="block text-sm text-black/50 dark:text-white/60 mb-1.5">Código postal</label>
            <input
              id="zipCode"
              v-model="form.zipCode"
              placeholder="15001"
              required
              :class="inputClass"
            />
          </div>
        </div>
      </div>

      <Transition name="shake">
        <p
          v-if="errorMessage"
          :key="errorMessage"
          class="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {{ errorMessage }}
        </p>
      </Transition>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full bg-gray-900 text-white dark:bg-white dark:text-black font-semibold py-3 rounded-lg disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
      >
        {{ isSubmitting ? 'Procesando...' : 'Pagar con Stripe' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { countries, peruRegions } from '~/data/peru-locations'

const cartStore = useCartStore()
const { createSession } = useCheckout()

const form = reactive({
  street: '',
  city: '',
  state: '',
  zipCode: '',
})

const selectedCountry = ref('Perú')
const customCountry = ref('')

const isSubmitting = ref(false)
const errorMessage = ref('')

const isPeru = computed(() => selectedCountry.value === 'Perú')

// País final que se envía: si eligieron "Otro", usamos lo que escribieron a mano
const resolvedCountry = computed(() =>
  selectedCountry.value === 'Otro' ? customCountry.value : selectedCountry.value
)

const regionNames = computed(() => Object.keys(peruRegions))

const citiesForSelectedRegion = computed(() => {
  if (!form.state || !peruRegions[form.state]) return []
  return peruRegions[form.state]
})

const onCountryChange = () => {
  form.state = ''
  form.city = ''
  if (selectedCountry.value !== 'Otro') customCountry.value = ''
}

const onRegionChange = () => {
  form.city = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const data = await createSession({ ...form, country: resolvedCountry.value })
    window.location.href = data.url
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Ocurrió un error al procesar el pago'
  } finally {
    isSubmitting.value = false
  }
}

// ---- Clases compartidas (Tailwind dark: en vez de CSS custom con :global) ----
const inputClass =
  'w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors ' +
  'bg-black/[0.03] dark:bg-white/5 ' +
  'border-black/15 dark:border-white/15 ' +
  'text-black dark:text-white ' +
  'placeholder:text-black/35 dark:placeholder:text-white/30 ' +
  'focus:outline-none focus:border-black/40 dark:focus:border-white/50 ' +
  'focus:bg-black/5 dark:focus:bg-white/10 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed'

const selectClass = inputClass + ' appearance-none pr-10 cursor-pointer'

// Chevron como componente inline: usa currentColor + dark:, así que
// siempre sigue el mismo mecanismo de tema que el resto de la página.
const ChevronIcon = {
  render() {
    return h(
      'svg',
      {
        class: 'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2',
      },
      [h('path', { d: 'M6 9l6 6 6-6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })]
    )
  },
}
</script>

<style scoped>
/* Solo queda la animación shake — nada de colores aquí */
.shake-enter-active {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

.shake-leave-active {
  transition: opacity 0.15s ease;
}

.shake-leave-to {
  opacity: 0;
}

@keyframes shake {
  0% { transform: translateX(0); opacity: 0; }
  15% { transform: translateX(-8px); opacity: 1; }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
  100% { transform: translateX(0); }
}
</style>