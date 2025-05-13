import { defineStore } from 'pinia'
import type { User } from '~/types/auth/user'
import { userApi } from '~/composables/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authenticated = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  /**
   * 设置用户token
   */
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 设置用户信息
   */
  const setUser = (newUser: User) => {
    user.value = newUser
  }

  /**
   * 设置认证状态
   */
  const setAuthenticated = (status: boolean) => {
    authenticated.value = status
  }

  /**
   * 初始化用户状态
   */
  const initUser = async () => {
    // 检查localStorage中是否有token
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return
    
    token.value = storedToken
    authenticated.value = true
    await fetchUserInfo()
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    if (!token.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await userApi.getUserInfo(token.value)
      
      if (response.code === 200 && response.data?.user) {
        user.value = response.data.user
        authenticated.value = true
      } else {
        // 如果获取用户信息失败，可能是token无效，清除token
        logout()
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
      error.value = '获取用户信息失败'
      logout()
    } finally {
      loading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = async () => {
    try {
      if (token.value) {
        // 调用登出API
        await userApi.logout()
      }
    } catch (err) {
      console.error('登出API调用失败:', err)
    } finally {
      // 不管API是否调用成功，都清除本地状态
      user.value = null
      token.value = null
      authenticated.value = false
      localStorage.removeItem('token')
    }
  }

  // 页面初始化时自动恢复用户状态
  onMounted(() => {
    if (import.meta.client) {
      initUser()
    }
  })

  return {
    user,
    token,
    loading,
    error,
    authenticated,
    isLoggedIn,
    setToken,
    setUser,
    setAuthenticated,
    logout,
    fetchUserInfo
  }
})