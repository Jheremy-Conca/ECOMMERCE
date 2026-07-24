import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'cliente' | 'vendedor'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    login(user: User) {
      this.user = user
      const cookie = useCookie<User | null>('auth_user')
      cookie.value = user
    },

    logout() {
      this.user = null
      const cookie = useCookie<User | null>('auth_user')
      cookie.value = null
    },

    hydrateFromCookie() {
      const cookie = useCookie<User | null>('auth_user')
      if (cookie.value) {
        this.user = cookie.value
      }
    },
  },
})