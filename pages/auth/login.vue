<template>
    <div class="flex justify-center items-center h-screen">
        <div class="auth-container flex flex-col w-[50%] h-[60%]">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <img class="mx-auto h-10 w-auto" src="http://54.255.84.100/i/2025/05/14/6823f89a2e094.webp" alt="NightNovel">
            <h2 class="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">登录账号</h2>
        </div>
    
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-900">用户名</label>
                <div class="mt-2">
                <input 
                    id="username" 
                    v-model="formData.username" 
                    type="text" 
                    required
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
                </div>
            </div>
    
            <div>
                <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-gray-900">密码</label>
                <div class="text-sm">
                    <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">忘记密码？</a>
                </div>
                </div>
                <div class="mt-2">
                <input 
                    id="password" 
                    v-model="formData.password" 
                    type="password" 
                    required
                    class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
                </div>
            </div>
    
            <div>
                <button 
                    type="submit" 
                    :disabled="loading"
                    class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400">
                {{ loading ? '登录中...' : '登录' }}
                </button>
            </div>
            </form>
    
            <p class="mt-10 text-center text-sm text-gray-500">
            还没有账号？
            <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">立即注册</NuxtLink>
            </p>
        </div>
        </div>
    </div>
  </template>
  
<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useUserStore } from '~/stores/user'

const $api = useNuxtApp().$api
const toast = useToast()
const userStore = useUserStore()

const formData = ref({
  username: '',
  password: ''
})

const loading = ref(false)

async function handleLogin() {
  try {
    loading.value = true
    const data = await $api.user.login(
      formData.value.username,
      formData.value.password
    )

    if (data.code === 200 && data.data) {
      userStore.setUser({
        id: data.data.user.id,
        username: data.data.user.username,
        avatar: data.data.user.avatar,
        token: data.data.token
      })
      toast.success(data.message)
      await navigateTo('/')
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    toast.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>