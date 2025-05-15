<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">NightFall今日推荐</h3>
    
    <div class="flex flex-col items-center text-center p-4 space-y-4">
      <div v-if="loading" class="flex items-center justify-center w-32 h-44">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
      <img 
        v-else-if="recommendedNovel"
        :src="coverImage" 
        :alt="recommendedNovel.title" 
        class="w-32 h-44 object-cover rounded-md shadow-md" 
        @error="handleImageError"
      >
      <div v-else class="w-32 h-44 flex items-center justify-center bg-gray-700 rounded-md">
        <p class="text-white text-sm">无封面</p>
      </div>

      <div class="text-white">
        <p class="font-bold text-lg">{{ recommendedNovel?.title || '加载中...' }}</p>
        <p class="text-sm text-purple-200">作者：{{ recommendedNovel?.author || '未知' }}</p>
      </div>

      <div v-if="error" class="text-red-400 text-sm">
        {{ error }}
      </div>

      <div class="flex gap-3 w-full justify-center">
        <button
          class="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-200"
          :class="{'opacity-50 cursor-not-allowed': !recommendedNovel}"
          @click="navigateToNovel" 
        >
          开始阅读
        </button>
        <button 
          :class="randomButtonClass"
          @click="fetchRandomNovel"
        >
          {{ isDebouncing ? '请稍候...' : '随机一本' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import type { ApiResponse } from '~/types/apiresponse'

// 状态管理
const loading = ref(false); // 初始不显示加载状态，避免SSR不匹配
const error = ref<string | null>(null);
const isDebouncing = ref(false); // 防抖状态

// 保存当前推荐小说
const currentNovel = ref<Novel | null>(null);

// 随机小说数据 - 只加载一次
const { data: randomResponse } = await useFetch<ApiResponse<{novel: Novel}>>('/api/novels/random', {
  method: 'GET',
  transform: (response) => response
});

// 响应式状态 - 用于显示
const recommendedNovel = computed<Novel | null>(() => {
  if (currentNovel.value) {
    return currentNovel.value;
  }
  
  if (randomResponse.value && 'data' in randomResponse.value && 
      randomResponse.value.code === 200 && randomResponse.value.data?.novel) {
    return randomResponse.value.data.novel;
  }
  return null;
});

// 计算小说封面图片
const coverImage = computed(() => {
  return recommendedNovel.value?.cover_url || 'https://placehold.co/128x176/222/444?text=Loading';
});

// 计算小说ID
const novelId = computed(() => {
  if (!recommendedNovel.value) return '';
  return recommendedNovel.value.id || recommendedNovel.value._id || '';
});

// 导航到小说详情页
const navigateToNovel = () => {
  if (!novelId.value) return;
  
  const path = `/novels/${novelId.value}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};

// 处理图片加载错误
const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://placehold.co/128x176/222/444?text=No+Image';
};

// 按钮样式
const randomButtonClass = computed(() => {
  return `px-3 py-2 text-white rounded-md transition duration-200 ${
    loading.value || isDebouncing.value 
      ? 'bg-gray-500 cursor-not-allowed' 
      : 'bg-blue-500 hover:bg-blue-600'
  }`;
});

// 获取随机小说
const fetchRandomNovel = async () => {
  // 如果正在加载或防抖中，不执行
  if (loading.value || isDebouncing.value) return;
  
  try {
    loading.value = true;
    isDebouncing.value = true; // 开始防抖
    console.log('正在获取随机小说...');
    
    // 使用$fetch直接发起请求而不是使用缓存的refresh
    const response = await $fetch<ApiResponse<{novel: Novel}>>('/api/novels/random', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('获取到随机小说响应:', response);
    
    if (response && response.code === 200 && response.data?.novel) {
      currentNovel.value = response.data.novel;
      console.log('成功设置新的随机小说:', currentNovel.value.title);
    } else {
      error.value = '获取随机小说失败';
      console.error('响应无效:', response);
    }
  } catch (err) {
    console.error('获取随机小说失败:', err);
    error.value = '获取小说出错';
  } finally {
    loading.value = false;
    
    // 设置防抖时间
    setTimeout(() => {
      isDebouncing.value = false;
    }, 1000);
  }
};

// 客户端加载完成后重置状态
onMounted(() => {
  // 延迟执行，确保组件完全挂载
  setTimeout(() => {
    loading.value = false;
  }, 100);
});
</script>
