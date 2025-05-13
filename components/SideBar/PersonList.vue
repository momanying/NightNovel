<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">✨️ 欢迎你 {{ userStore.user?.username }}！✨️</h3>
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
          @click.prevent="logout" 
        >
          <span class="flex items-center">
            <i class="i-ph:sign-out-fill mr-2" />
            退出登录
          </span>
        </a>
      </li>
    </ul>
    <div v-else class="flex justify-center py-4">
      <div class="w-6 h-6 border-2 border-t-transparent border-gray-300 rounded-full animate-spin" />
    </div>
    <p v-if="error" class="text-red-400 text-center py-2 px-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();
const loading = ref(false);
const error = ref('');
const bookshelfCount = ref(0);
const commentsCount = ref(0);
const historyCount = ref(0);
const router = useRouter();

interface CountResponse {
  code: number;
  message: string;
  data?: {
    count: number;
  } | null;
  error?: string;
}

// 获取用户数据
const fetchUserData = async () => {
  if (!userStore.isLoggedIn) {
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    // 获取用户书架、评论和历史信息
    const [bookshelfResponse, historyResponse] = await Promise.all([
      $fetch<CountResponse>('/api/user/bookshelf/count'),
      $fetch<CountResponse>('/api/user/history/count')
    ]);
    
    bookshelfCount.value = bookshelfResponse.data?.count || 0;
    historyCount.value = historyResponse.data?.count || 0;
  } catch (err) {
    console.error('获取用户数据失败:', err);
    error.value = '获取用户数据失败';
  } finally {
    loading.value = false;
  }
};

// 退出登录
const logout = async () => {
  try {
    await userStore.logout();
    // 退出后跳转到首页
    router.push('/');
  } catch (err) {
    console.error('退出登录失败:', err);
    error.value = '退出登录失败';
  }
};

// 页面导航
const navigateTo = (path: string) => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  router.push(path);
};

// 页面加载时获取数据
onMounted(fetchUserData);

// 监听用户登录状态变化
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    fetchUserData();
  } else {
    bookshelfCount.value = 0;
    commentsCount.value = 0;
    historyCount.value = 0;
  }
});
</script>
