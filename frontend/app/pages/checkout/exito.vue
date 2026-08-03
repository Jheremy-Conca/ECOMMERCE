<template>
    <div class="max-w-lg mx-auto px-4 py-20 text-center">
        <template v-if="status === 'polling'">
            <div class="animate-spin h-10 w-10 border-2 border-white/30 border-t-white rounded-full mx-auto mb-6" />
            <p class="text-white/60">Confirmando tu pago...</p>
        </template>

        <template v-else-if="status === 'paid'">
            <h1 class="text-2xl font-bold mb-3">¡Compra confirmada!</h1>
            <p class="text-white/60 mb-8">Tu pedido fue pagado correctamente.</p>
            <a
                v-if="invoiceUrl"
                :href="invoiceUrl"
                target="_blank"
                class="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg"
                >Ver boleta</a>
            
        </template>

        <template v-else-if="status === 'timeout'">
            <h1 class="text-2xl font-bold mb-3">Estamos confirmando tu pago</h1>
            <p class="text-white/60 mb-8">
                Puede tardar unos segundos más. Revisa tu correo o vuelve a intentar en un momento.
            </p>
            <NuxtLink to="/" class="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg">
                Volver al inicio
            </NuxtLink>
        </template>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { apiFetch } = useApi()

const status = ref<'polling' | 'paid' | 'timeout'>('polling')
const invoiceUrl = ref<string | null>(null)

const orderId = route.query.orderId as string | undefined

let attempts = 0
const maxAttempts = 10 // ~20s con intervalo de 2s

const checkStatus = async () => {
    if (!orderId) {
        status.value = 'timeout'
        return
    }

    try {
        const res = await apiFetch<{ data: { status: string } }>(`/orders/${orderId}`)
        if (res.data.status === 'PAID') {
            status.value = 'paid'
            const invoice = await apiFetch<{ data: { invoiceUrl: string } }>(
                `/checkout/orders/${orderId}/invoice`
            )
            invoiceUrl.value = invoice.data.invoiceUrl
            return
        }
    } catch {
        // seguimos intentando
    }

    attempts++
    if (attempts >= maxAttempts) {
        status.value = 'timeout'
        return
    }
    setTimeout(checkStatus, 2000)
}

onMounted(checkStatus)
</script>