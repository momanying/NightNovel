<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 v-if="!userStore.isLoggedIn" class="bg-gray-700 text-white font-medium text-lg py-3 px-4">✨️ 收藏，评论，请<NuxtLink to="/auth/login" class="text-blue-500 border-b-1">登录</NuxtLink>！✨️</h3>
    <div v-else>
      <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">✨️ 欢迎你 {{ userStore.username }}！✨️</h3>
      <ul v-if="!loading" class="space-y-3 px-4 py-3">
        <li>
          <a 
            href="#" 
            class="flex justify-between items-center text-gray-200 hover:text-orange-400 transition duration-200"
            @click.prevent="navigateTo('/bookshelf')" 
          >
            <span class="flex items-center">
              <i class="i-ph:book-bookmark-fill mr-2"/>
              我的书架
            </span>
            <span  v-if="bookshelfCount" class="text-sm text-purple-300">({{ bookshelfCount }})</span>
          </a>
        </li>
        
        <li>
          <a 
            href="#" 
            class="flex justify-between items-center text-gray-200 hover:text-orange-400 transition duration-200"
            @click.prevent="navigateTo('/history')" 
          >
            <span class="flex items-center">
              <i class="i-ph:clock-clockwise-fill mr-2" />
              最近浏览
            </span>
            <span  v-if="historyCount" class="text-sm text-purple-300">({{ historyCount }})</span>
          </a>
        </li>
        <li>
          <a 
            href="#" 
            class="flex justify-between items-center text-gray-200 hover:text-orange-400 transition duration-200"
          >
            <span class="flex items-center">
              <i class="i-ph:sign-out-fill mr-2" />
              我的书评
            </span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const loading = ref(false);
const bookshelfCount = ref(0);
const historyCount = ref(0);
const router = useRouter();

// 页面导航
const navigateTo = (path: string) => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  router.push(path);
};
</script>
