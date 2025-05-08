<template>
    <div class="popular-ranking">
      <h2 class="text-xl font-bold mb-4 text-white border-l-4 border-indigo-600 pl-3">人气排行</h2>
      <div class="flex justify-center items-end overflow-hidden border-b border-dashed border-gray-600 mb-4">
          <!-- 第二名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(topNovels[1].id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img 
                    class="w-full h-full object-cover"
                    :src="topNovels[1].cover_url" 
                    :alt="topNovels[1].title" 
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ topNovels[1].title }}</div>
                  </div>
              </div>
              <div class="w-full h-[12.5px] rounded-t-lg bg-gradient-to-r from-gray-400 to-gray-300 shadow-md" />
          </div>
          <!-- 第一名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(topNovels[0].id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img
                    class="w-full h-full object-cover" 
                    :src="topNovels[0].cover_url" 
                    :alt="topNovels[0].title" 
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ topNovels[0].title }}</div>
                  </div>
              </div>
              <div class="w-full h-[15px] rounded-t-lg bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-md" />
          </div>
          <!-- 第三名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(topNovels[2].id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img
                    class="w-full h-full object-cover" 
                    :src="topNovels[2].cover_url" 
                    :alt="topNovels[2].title" 
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ topNovels[2].title }}</div>
                  </div>
              </div>
              <div class="w-full h-[10px] rounded-t-lg bg-gradient-to-r from-amber-700 to-amber-500 shadow-md" />
          </div>
      </div>
      <!-- 4-10名列表 -->
      <div class="px-4">
          <ul>
              <li 
                v-for="(novel, index) in topNovels.slice(3, 10)" 
                :key="novel.id"
                class="text-white text-sm py-0.5 leading-normal text-left relative cursor-pointer transition-all duration-300 hover:translate-x-1 hover:text-yellow-400"
                @click="openNovelDetail(novel.id || 0)"
              >
                {{ index + 4 }}、{{ novel.title }}
              </li>
          </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import type { Novel } from '~/types/novel/novelinfo';
  
  const props = defineProps({
      novels: {
          type: Array as () => Novel[],
          required: true,
      },
  });
  
  const topNovels = computed(() => {
      const result = [...props.novels];
      if(result.length < 10) {
          for(let i = result.length; i < 10; i++) {
              result.push({
                  id: `placeholder-${i}`,
                  title: '暂无数据',
                  author: '-',
                  cover_url: 'https://placehold.co/200x300/cccccc/333333?text=暂无数据',
                  category: '-',
                  status: '-',
                  word_count: 0,
                  views: 0,
                  rating: 0,
                  tags: '-',
              });
          }
      }
      return result.slice(0, 10);
  });
  
  // 在新窗口打开小说详情页
  const openNovelDetail = (id: number | string) => {
      // 检查ID是否为占位符ID
      if (typeof id === 'string' && id.startsWith('placeholder-')) {
          return; // 不处理占位符ID的点击
      }
      
      localStorage.setItem('novelId', String(id));
      const path = `/novels/${id}`;
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = path;
      }
  };
  
  const handleImageError = (e : Event) => {
      if (e.target instanceof HTMLImageElement) {
          e.target.src = 'https://placehold.co/200x300/cccccc/333333?text=加载失败';
      }
  };
  </script>
  
<style scoped>
.popular-ranking {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    width: 350px;
    overflow: hidden;
}
</style>