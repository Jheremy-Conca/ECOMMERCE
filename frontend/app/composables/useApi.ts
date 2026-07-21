export const useApi = () => {
  const config = useRuntimeConfig()

  const apiFetch = async <T>(endpoint: string, options: any = {}): Promise<T> => {
    return await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
      ...options,
      credentials: 'include',
    })
  }

  return { apiFetch }
}