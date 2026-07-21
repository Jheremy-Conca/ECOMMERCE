import { defineStore } from 'pinia'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
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