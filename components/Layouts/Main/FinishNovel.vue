<template>
    <div class="bg-sky-500/10 rounded-lg shadow-lg p-5 mt-10">
      <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">完本推荐</h2>
      <div 
      v-if="novels && novels.length > 0"
        class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1"
        >
        <div
          v-for="(novel, index) in novels.slice(0, 12)"
          :key="novel._id || index"
          class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1"
          @click="navigateToNovel(novel._id || 0)"
        >
          <NuxtImg
            class="w-28 h-40 object-cover rounded-md mb-2"
            :src="novel.cover_url"
            :alt="novel.title"
            loading="lazy"
            format="webp"
            sizes="112px"
          />
          <h3 class="text-sm font-medium text-white mt-1">{{ novel.title }}</h3>
          <p class="text-xs text-gray-400">{{ novel.author }}</p>
        </div>
      </div>
      <div v-else class="text-center py-10">
        <p class="text-gray-400">暂无已完结小说</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

defineProps({
    novels: {
        type: Array as () => Novel[],
        required: true
    }
})

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