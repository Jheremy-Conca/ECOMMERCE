<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
    email: '',
    password: '',
})

const validationError = ref('')
const { isLoading, error: submitError, run } = useAsyncAction()

const redirectPath = computed(() => (route.query.redirect as string) || '/')

const infoMessage = computed(() => {
    if (redirectPath.value.startsWith('/checkout')) {
        return 'Inicia sesión para continuar tu compra.'
    }
    if (route.query.redirect) {
        return 'Inicia sesión para continuar.'
    }
    return ''
})

async function submitLogin() {
    validationError.value = ''

    if (!form.email || !form.password) {
        validationError.value = 'Completa todos los campos.'
        return
    }

    const result = await run(() => {
        authStore.login({
            id: '1',
            fullName: 'Usuario de Prueba',
            email: form.email,
        })
        return true
    })

    if (result) {
        const { showToast } = useToast()
        showToast('Sesión iniciada correctamente')
        router.push(redirectPath.value)
    }
}
</script>

<template>
    <div class="max-w-md mx-auto px-4 py-16">
        <h1 class="text-2xl font-bold mb-2">Iniciar sesión</h1>

        <div v-if="infoMessage"
            class="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 mb-6">
            <span class="text-blue-400 text-lg leading-none">ℹ️</span>
            <p class="text-sm text-blue-400">{{ infoMessage }}</p>
        </div>
        <div v-else class="mb-8" />

        <form @submit.prevent="submitLogin" class="space-y-4">
            <div>
                <label class="block text-sm mb-1">Correo electrónico</label>
                <input v-model="form.email" type="email" required :disabled="isLoading"
                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
            </div>

            <div>
                <label class="block text-sm mb-1">Contraseña</label>
                <input v-model="form.password" type="password" required :disabled="isLoading"
                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
            </div>

            <p v-if="validationError" class="text-red-500 text-sm">{{ validationError }}</p>
            <p v-if="submitError" class="text-red-500 text-sm">{{ submitError }}</p>

            <button type="submit" :disabled="isLoading"
                class="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                <Spinner v-if="isLoading" size="sm" />
                {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
            </button>
        </form>

        <p class="text-sm text-zinc-500 mt-6 text-center">
            ¿No tienes cuenta?
            <NuxtLink :to="{ path: '/registro', query: route.query.redirect ? { redirect: route.query.redirect } : {} }"
                class="text-blue-400 underline">Regístrate</NuxtLink>
        </p>
    </div>
</template>