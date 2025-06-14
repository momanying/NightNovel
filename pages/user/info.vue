<template>
    <!-- Main Content -->
    <div class="w-full space-y-6">
      <!-- Header Section -->
      <div class="bg-gray-700/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <!-- User Avatar -->
          <div class="relative group">
            <img 
              :src="userdata.avatar || '/images/default-cover.jpg'" 
              alt="用户头像" 
              class="w-24 h-24 rounded-lg object-cover border-2 border-primary-500 shadow-md"
            >
            <!-- Avatar change functionality moved to /user/avatar -->
          </div>
          
          <!-- User Basic Info -->
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 class="text-3xl font-bold text-gray-100 dark:text-white">{{ userdata.username }}</h1>
              <span class="text-sm text-gray-400 dark:text-gray-500 pt-1">ID: {{ userdata.userId }}</span>
            </div>
            <div class="flex flex-wrap gap-3 mt-3">
              <UBadge v-if="userProfile.email" color="gray" variant="solid" size="md">
                <template #leading><Icon name="i-heroicons-envelope" class="w-4 h-4" /></template>
                {{ userProfile.email }}
              </UBadge>
              <UBadge v-if="userProfile.website" :to="userProfile.website" target="_blank" color="gray" variant="solid" size="md">
                <template #leading><Icon name="i-heroicons-globe-alt" class="w-4 h-4" /></template>
                {{ userProfile.website || '未设置网站' }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Details Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- User Info Card -->
        <div class="bg-gray-700/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 class="text-xl font-semibold text-gray-100 dark:text-white mb-5 border-b border-gray-600 dark:border-gray-700 pb-3">
            用户资料
          </h2>
          <div class="space-y-5">
            <div v-for="(item, index) in userInfoItems" :key="index" class="grid grid-cols-3 gap-4 py-2 text-sm">
              <div class="text-gray-400 dark:text-gray-500 font-medium">{{ item.label }}</div>
              <div class="col-span-2 text-gray-200 dark:text-gray-300">{{ item.value }}</div>
            </div>
          </div>
        </div>
        
        <!-- User Stats Card -->
        <div class="bg-gray-700/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-semibold text-gray-100 dark:text-white mb-5 border-b border-gray-600 dark:border-gray-700 pb-3">
            积分相关
          </h2>
          <div class="space-y-5">
            <div v-for="(item, index) in userStatsItems" :key="index" class="grid grid-cols-3 gap-4 py-2 text-sm">
              <div class="text-gray-400 dark:text-gray-500 font-medium">{{ item.label }}</div>
              <div class="col-span-2 text-gray-200 dark:text-gray-300 font-semibold">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
// Imports remain for toast and userStore, but avatar-specific refs and functions are removed.
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

const userdata = computed(() => ({
  username: userStore.username,
  avatar: userStore.avatar,
  token: userStore.token,
  userId: userStore.id 
}));

const userProfile = ref({
  email: userStore.email || '1428873445@qq.com',
  website: '',
  gender: '保密',
  title: '天然',
  nickname: 'みつき' 
});

const userInfoItems = computed(() => [
  { label: '用户名', value: userdata.value.username || 'N/A' },
  { label: '昵称', value: userProfile.value.nickname }, 
  { label: '头衔', value: userProfile.value.title },
  { label: '性别', value: userProfile.value.gender },
  { label: 'Email', value: userProfile.value.email }, 
  { label: 'QQ', value: '-' },
  { label: '网站', value: userProfile.value.website || '-' },
  { label: '注册日期', value: '2025-05-02' } 
]);

const userStatsItems = [
  { label: '经验值', value: '25' },
  { label: '现有积分', value: '25' },
  // ... other stats items
  { label: '每天允许评分次数', value: '1' }
];
</script>


