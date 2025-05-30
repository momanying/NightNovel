<template>
  <div class="bg-sky-500/10 rounded-lg shadow-lg p-3 sm:p-5 mt-5">
    <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">完本推荐</h2>
    
    <!-- 桌面端网格布局 -->
    <div 
      v-if="novels"
      class="ml-6 grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1"
      >
      <div
        v-for="(novel, index) in novels.slice(0, 12)"
        :key="index"
        class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        @click="navigateToNovel(novel._id || 0)"
      >
        <div class="w-28 h-40 rounded-md overflow-hidden">
          <NuxtImg
            class="w-full h-full object-cover rounded-md"
            :src="novel.cover_url || '/images/default-cover.webp'"
            :alt="novel.title"
            loading="lazy"
            format="webp"
            sizes="112px"
          />
        </div>
        <h3 class="text-sm font-medium text-white mt-1 line-clamp-1">{{ novel.title }}</h3>
        <p class="text-xs text-gray-400 line-clamp-1">{{ novel.author }}</p>
      </div>
    </div>

    <!-- 移动端水平滚动布局 -->
    <div
      v-if="novels && isMobile"
      class="sm:hidden overflow-x-auto pb-2 -mx-3 px-3"
    >
      <div class="flex space-x-4 p-2">
        <div
          v-for="(novel, index) in novels.slice(0, 12)"
          :key="index"
          class="flex-shrink-0 w-28 cursor-pointer transition-all duration-300"
          @click="navigateToNovel(novel._id || 0)"
        >
          <div class="relative w-28 h-40 rounded-md overflow-hidden">
            <NuxtImg
              class="w-full h-full object-cover rounded-md"
              :src="novel.cover_url"
              :alt="novel.title"
              loading="lazy"
              format="webp"
              sizes="112px"
              placeholder
            />
          </div>
          <h3 class="text-sm font-medium text-white mt-2 line-clamp-1">{{ novel.title }}</h3>
          <p class="text-xs text-gray-400 line-clamp-1">{{ novel.author }}</p>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

defineProps({
    novels: {
        type: Array as () => Novel[],
        required: true,
    }
});

// 检测是否为移动设备
const isMobile = ref(false);

onMounted(() => {
  // 初始检测
  checkIsMobile();
  
  // 添加窗口调整事件监听器
  window.addEventListener('resize', checkIsMobile);
});

onBeforeUnmount(() => {
  // 移除事件监听器
  window.removeEventListener('resize', checkIsMobile);
});

// 检测屏幕宽度判断是否为移动设备
const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 640; // sm断点为640px
};

// 添加导航到小说详情页的函数
const navigateToNovel = (id: number | string) => {
  // 使用Nuxt的navigateTo是更好的方式，但如果需要在新窗口打开，保留原方式
  const path = `/novels/${id}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};
</script>

<style scoped>
/* 设置滚动条样式 */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.5);
  border-radius: 20px;
}
</style>