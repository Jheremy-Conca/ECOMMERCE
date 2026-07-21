export function useAsyncAction() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(
    fn: () => Promise<T> | T,
    options?: { delay?: number; simulateError?: boolean; errorMessage?: string }
  ): Promise<T | null> {
    isLoading.value = true
    error.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, options?.delay ?? 600))

      if (options?.simulateError) {
        throw new Error(options.errorMessage ?? 'Ocurrió un error inesperado.')
      }

      return await fn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ocurrió un error inesperado.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, run }
}