import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'cliente' | 'vendedor'

export interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
}

export interface AuthApiResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    login(user: User, token: string) {
      this.user = user
      this.token = token

      const userCookie = useCookie<User | null>('auth_user')
      userCookie.value = user

      const tokenCookie = useCookie<string | null>('auth_token')
      tokenCookie.value = token
    },

    logout() {
      this.user = null
      this.token = null

      const userCookie = useCookie<User | null>('auth_user')
      userCookie.value = null

      const tokenCookie = useCookie<string | null>('auth_token')
      tokenCookie.value = null
    },

    hydrateFromCookie() {
      const userCookie = useCookie<User | null>('auth_user')
      const tokenCookie = useCookie<string | null>('auth_token')
      if (userCookie.value) {
        this.user = userCookie.value
      }
      if (tokenCookie.value) {
        this.token = tokenCookie.value
      }
    },
  },
})