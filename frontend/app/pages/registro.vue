<script setup lang="ts">
const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
})

const validationError = ref('')
const { isLoading, error: submitError, run } = useAsyncAction()

async function submitRegistro() {
    validationError.value = ''

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        validationError.value = 'Completa todos los campos.'
        return
    }

    if (form.password !== form.confirmPassword) {
        validationError.value = 'Las contraseñas no coinciden.'
        return
    }

    if (form.password.length < 6) {
        validationError.value = 'La contraseña debe tener al menos 6 caracteres.'
        return
    }

    const result = await run(() => {
        authStore.login({
            id: '1',
            fullName: form.name, // en registro.vue
            email: form.email,
        })
        return true
    })

    if (result) {
        const { showToast } = useToast()
        showToast('Cuenta creada correctamente')
        router.push('/')
    }
}
</script>

<template>
    <div class="max-w-md mx-auto px-4 py-16">
        <h1 class="text-2xl font-bold mb-8">Crear cuenta</h1>

        <form @submit.prevent="submitRegistro" class="space-y-4">
            <div>
                <label class="block text-sm mb-1">Nombre completo</label>
                <input v-model="form.name" type="text" required :disabled="isLoading"
                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
            </div>

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

            <div>
                <label class="block text-sm mb-1">Confirmar contraseña</label>
                <input v-model="form.confirmPassword" type="password" required :disabled="isLoading"
                    class="w-full border border-zinc-300 dark:border-zinc-700 bg-transparent rounded px-3 py-2 disabled:opacity-50" />
            </div>

            <p v-if="validationError" class="text-red-500 text-sm">{{ validationError }}</p>
            <p v-if="submitError" class="text-red-500 text-sm">{{ submitError }}</p>

            <button type="submit" :disabled="isLoading"
                class="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                <Spinner v-if="isLoading" size="sm" />
                {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
        </form>

        <p class="text-sm text-zinc-500 mt-6 text-center">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login" class="text-blue-400 underline">Inicia sesión</NuxtLink>
        </p>
    </div>
</template>