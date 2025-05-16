<template>
    <div class="flex justify-center items-center h-screen">
        <div class="flex flex-col w-[50%] h-[60%] bg-sky-950 z-1">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm mt-5">
            <img class="mx-auto h-20 w-auto" src="http://54.255.84.100/i/2025/05/14/6823f89a2e094.webp" alt="NightNovel">
            <h2 class="mt-5 text-center text-2xl font-bold tracking-tight text-white">欢迎来到夜幕，请登录</h2>
        </div>
    
        <div class="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" @submit.prevent="handleLogin">
            <div>
                <label for="username" class="block text-sm font-medium text-white">用户名</label>
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
                <label for="password" class="block text-sm font-medium text-white">密码</label>
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
                    class="gradient-border flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 z-1">
                {{ loading ? '登录中...' : '登录' }}
                </button>
            </div>
            </form>
    
            <p class="mt-10 text-center text-sm text-white">
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

<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:200');

#box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 200px;
  color: white;
  font-family: 'Raleway';
  font-size: 2.5rem;
}
.gradient-border {
  --borderWidth: 3px;
  position: relative;
  border-radius: var(--borderWidth);
}
.gradient-border:after {
  content: '';
  position: absolute;
  top: calc(-1 * var(--borderWidth));
  left: calc(-1 * var(--borderWidth));
  height: calc(100% + var(--borderWidth) * 2);
  width: calc(100% + var(--borderWidth) * 2);
  background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
  border-radius: calc(2 * var(--borderWidth));
  animation: animatedgradient 4s ease alternate infinite;
  background-size: 300% 300%;
  opacity: 0.5;
}


@keyframes animatedgradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

</style>