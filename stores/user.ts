import { defineStore } from 'pinia'
import type { LoginResponseData } from '~/types/user/userauth'

export const useUserStore = defineStore('NightUser', {
  persist: true,
  state: () => ({
    id: '',
    username: '',
    avatar: '',
    token: '',
    email: '',
    refreshToken: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.id && !!state.token,
  },
  actions: {
    setUser(user: LoginResponseData) {
      this.id = user.id
      this.username = user.username
      this.avatar = user.avatar
      this.token = user.token
      this.email = user.email
      if (user.refreshToken) {
        this.refreshToken = user.refreshToken
      }
    },
    logout() {
      this.id = ''
      this.username = ''
      this.avatar = ''
      this.token = ''
      this.email = ''
      this.refreshToken = ''
    },
    async refreshTokenIfNeeded() {
      if (!this.refreshToken) return false
      
      try {
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken: this.refreshToken }
        })
        
        if (response.code === 200 && response.data?.token) {
          this.token = response.data.token
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to refresh token:', error)
        return false
      }
    }
  }
})