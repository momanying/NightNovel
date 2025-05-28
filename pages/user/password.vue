<template>
    <div>
      <div class="w-full space-y-6 p-2">
        <div class="bg-gray-700/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-100 dark:text-white mb-5 border-b border-gray-600 dark:border-gray-700 pb-3">
                修改密码
            </h2>
            
            <form class="space-y-6" @submit.prevent="handleChangePassword">
                <div>
                <label for="oldPassword" class="block text-sm font-medium text-gray-300 dark:text-gray-400">
                    当前密码
                </label>
                <div class="mt-1">
                    <input 
                    id="oldPassword" 
                    v-model="oldPassword"
                    name="oldPassword" 
                    type="password" 
                    autocomplete="current-password" 
                    required 
                    class="appearance-none block w-full px-3 py-2 border border-gray-600 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200"
                    >
                </div>
                </div>

                <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-300 dark:text-gray-400">
                    新密码
                </label>
                <div class="mt-1">
                    <input 
                    id="newPassword" 
                    v-model="newPassword"
                    name="newPassword" 
                    type="password" 
                    autocomplete="new-password" 
                    required 
                    class="appearance-none block w-full px-3 py-2 border border-gray-600 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200"
                    >
                </div>
                </div>

                <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-300 dark:text-gray-400">
                    确认新密码
                </label>
                <div class="mt-1">
                    <input 
                    id="confirmPassword" 
                    v-model="confirmPassword"
                    name="confirmPassword" 
                    type="password" 
                    autocomplete="new-password" 
                    required 
                    class="appearance-none block w-full px-3 py-2 border border-gray-600 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200"
                    >
                </div>
                </div>
                
                <div v-if="passwordError" class="text-sm text-red-400">
                {{ passwordError }}
                </div>

                <div>
                    <button 
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <template v-if="isSubmitting">
                    更新中...
                    </template>
                    <template v-else>
                    更新密码
                    </template>
                    </button>
                </div>
            </form>     
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useUserStore } from '~/stores/user';
import type { LayoutKey } from '#build/types/layouts';

definePageMeta({
  layout: 'user-center' as LayoutKey,
  // middleware: ['auth-user'], // Assuming you have an auth middleware for user pages
});

const toast = useToast();
const userStore = useUserStore();
const router = useRouter();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordError = ref<string | null>(null);
const isSubmitting = ref(false);

const handleChangePassword = async () => {
  passwordError.value = null;
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '新密码和确认密码不匹配。';
    toast.error('新密码和确认密码不匹配。');
    return;
  }

  if (newPassword.value.length < 6) { // Example: Minimum password length
    passwordError.value = '新密码长度至少需要6位。';
    toast.error('新密码长度至少需要6位。');
    return;
  }

  if (!userStore.token) {
    toast.error('用户未登录或会话已过期，请重新登录。');
    router.push('/auth/login');
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch<{ success: boolean; message: string }>('/api/user/password', {
      method: 'POST',
      body: {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
      },
      headers: {
        'Authorization': `Bearer \${userStore.token}`,
      },
    });

    if (response.success) {
      toast.success(response.message || '密码已成功更新！');
      oldPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      // Optionally redirect or perform other actions
    } else {
      passwordError.value = response.message || '无法更新密码，请检查您输入的当前密码是否正确。';
      toast.error(response.message || '无法更新密码，请检查您输入的当前密码是否正确。');
    }
  } catch (error: unknown) {
    console.error('Change password error:', error);
    let errorMessage = '修改密码时发生未知错误。';
    if (typeof error === 'object' && error !== null && 'data' in error) {
      const errorData = (error as { data?: { message?: string } }).data;
      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    passwordError.value = errorMessage;
    toast.error(`修改失败: ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
