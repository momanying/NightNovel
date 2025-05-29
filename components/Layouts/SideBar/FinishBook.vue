<template>
    <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">完本推荐</h3>
      <div class="px-4">
        <ul>
          <li 
            v-for="(novel, index) in novels.slice(0,10)" 
            :key="novel._id"
            class="truncate text-white text-sm py-0.5 leading-normal text-left relative cursor-pointer transition-all duration-300 hover:translate-x-1 hover:text-yellow-400
            border-b border-dashed border-gray-700"
            @click="navigateToNovel(novel._id || '')"
          >
            {{ index + 1 }}、{{ novel.title }}
          </li>
        </ul>
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
})

// 添加导航到小说详情页的函数
const navigateToNovel = (id: string) => {
  // 使用Nuxt的navigateTo是更好的方式，但如果需要在新窗口打开，保留原方式
  const path = `/novels/${id}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};
</script>
  