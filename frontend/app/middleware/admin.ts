export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Si no hay sesión, mandamos a login (mismo patrón que auth.ts)
  if (!authStore.isLoggedIn) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Si hay sesión pero no es admin, no tiene acceso
  if (authStore.user?.role !== 'admin') {
    return navigateTo('/')
  }
})