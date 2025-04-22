<template>
  <div class="flex justify-center items-center h-screen">
    <div class="auth-container flex flex-col w-[50%] h-[80%]">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img class="mx-auto h-10 w-auto" src="/public/avatar.png" alt="NightNovel">
        <h2 class="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">注册账号</h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" @submit.prevent="handleRegister">
            <div>
            <label for="username" class="block text-sm font-medium text-gray-900">用户名</label>
            <div class="mt-2">
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
            <div class="mt-2">
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
            <div class="mt-2">
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
            <div class="mt-2">
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

        <p class="mt-10 text-center text-sm text-gray-500">
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
import type { ApiError } from '~/types/auth/apierror'

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
      userStore.setToken(data.data.token)
      userStore.setUser(data.data.user)
      toast.success(data.message)
      await navigateTo('/auth/login')
    } 
  } catch (error: unknown) {
    // 改进错误处理
    const err = error as ApiError
    if (err.data?.data?.errors) {
      const errors = err.data.data.errors;
      for (const key in errors) {
        toast.error(errors[key]);
      }
    } else if (err.data?.message) {
      toast.error(err.data.message);
    } else {
      toast.error('注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>