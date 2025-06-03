<template>
  <div class="flex justify-center items-center h-screen">
    <div class="auth-container flex flex-col w-[50%] h-[80%] z-1 rounded-lg">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm mt-5">
            <img class="mx-auto h-20 w-auto" src="http://54.255.84.100/i/2025/05/14/6823f89a2e094.webp" alt="NightNovel">
            <h2 class="mt-5 text-center text-2xl font-bold tracking-tight text-black">欢迎来到夜幕，请注册</h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleRegister">
            <div>
            <label for="username" class="block text-sm font-medium text-gray-900">用户名</label>
            <div>
                <input
                id="username"
                v-model="formData.username"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                type="text"
                required
                >
            </div>
            </div>

            <div>
            <label for="email" class="block text-sm font-medium text-gray-900">邮箱</label>
            <div>
                <input
                id="email"
                v-model="formData.email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                type="email"
                required
                >
            </div>
            </div>

            <div>
            <label for="password" class="block text-sm font-medium text-gray-900">密码</label>
            <div>
                <input
                id="password"
                v-model="formData.password"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                type="password"
                required
                >
            </div>
            </div>

            <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-900">确认密码</label>
            <div>
                <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                type="password"
                required
                >
            </div>
            </div>

            <div>
            <button 
                type="submit" 
                :disabled="loading"
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400">
                {{ loading ? '注册中...' : '注册' }}
            </button>
            </div>
        </form>

        <p class="mt-5 text-center text-sm text-gray-500">
            已有账号？
            <NuxtLink to="/auth/login" class="font-semibold text-indigo-600 hover:text-indigo-500">立即登录</NuxtLink>
        </p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useUserStore } from '~/stores/user'
import type { ApiError } from '~/types/apiresponse'

const toast = useToast()
const userStore = useUserStore()
const { $api } = useNuxtApp()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

async function handleRegister() {
  // 表单验证
  if (formData.value.password !== formData.value.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }

  // 添加密码长度验证
  if (formData.value.password.length < 6 || formData.value.password.length > 20) {
    toast.error('密码长度应在6-20个字符之间')
    return
  }

  try {
    loading.value = true
    // 使用封装的 API 方法
    const data = await $api.user.register(
      formData.value.username,
      formData.value.email,
      formData.value.password
    )
    if (data.code === 200 && data.data) {
      userStore.setUser({
        id: data.data.user.id,
        username: data.data.user.username,
        avatar: data.data.user.avatar,
        token: data.data.token,
        email: data.data.email
      })
      toast.success(data.message)
      await navigateTo('/auth/login')
    } 
  } catch (error: unknown) {
    // 改进错误处理
    const err = error as ApiError
    if (err) {
        toast.error(err.message);
    } 
  }
    finally {
    loading.value = false
  }
}
</script>