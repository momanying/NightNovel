<template>
    <div class="bg-sky-500/10 rounded-lg shadow-lg p-5">
    <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">最近更新</h2>
    <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1">
      <div
        v-for="(novel, index) in novels.slice(0, 15)"
        :key="index"
        class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        @click="navigateToNovel(novel.id || 0)"
      >
        <img
          class="w-28 h-40 object-cover rounded-md mb-2"
          :src="novel.cover_url"
          :alt="novel.title"
          @error="handleImageError"
        >
        <h3 class="text-sm font-medium text-white mt-1">{{ novel.title }}</h3>
        <p class="text-xs text-gray-400">{{ novel.author }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '@/types/novel/novel';

defineProps({
    novels: {
        type: Array as () => Novel[],
        required: true
    }
})
// 添加图片错误处理函数
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://placehold.co/200x300/cccccc/333333?text=加载失败';
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