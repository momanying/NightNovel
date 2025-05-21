import { defineStore } from 'pinia'
import type { LoginResponseData } from '~/types/user/userauth'

export const useUserStore = defineStore('NightUser', {
  persist: true,
  state: () => ({
    id: '',
    username: '',
    avatar: '',
    token: '',
    email: ''
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
    },
    logout() {
      this.id = ''
      this.username = ''
      this.avatar = ''
      this.token = ''
      this.email = ''
    }
  }
})