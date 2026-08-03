export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const apiFetch = async <T>(endpoint: string, options: any = {}): Promise<T> => {
    try {
      return await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
        },
      })
    } catch (err: any) {
      // El backend devuelve { success: false, message: '...' } — extraemos el mensaje real
      // en vez de dejar pasar el genérico de $fetch ("400 Bad Request", etc.)
      const message = err?.data?.message || 'Ocurrió un error al conectar con el servidor.'
      throw new Error(message)
    }
  }

  return { apiFetch }
}