<template>
    <div class="rounded-xl shadow-md w-[350px] overflow-hidden">
      <h2 class="text-xl font-bold mb-4 text-white border-l-4 border-indigo-600 pl-3">人气排行</h2>
      
      <div class="flex justify-center items-end overflow-hidden border-b border-dashed border-gray-600 mb-4">
          <!-- 第二名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(rankItem(1)?._id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img 
                    class="w-full h-full object-cover"
                    :src="rankItem(1)?.cover_url || placeholderImage" 
                    :alt="rankItem(1)?.title || '加载中'"
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ rankItem(1)?.title || '加载中' }}</div>
                  </div>
              </div>
              <div class="w-full h-[12.5px] rounded-t-lg bg-gradient-to-r from-gray-400 to-gray-300 shadow-md" />
          </div>
          <!-- 第一名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(rankItem(0)?._id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img
                    class="w-full h-full object-cover" 
                    :src="rankItem(0)?.cover_url || placeholderImage" 
                    :alt="rankItem(0)?.title || '加载中'" 
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ rankItem(0)?.title || '加载中' }}</div>
                  </div>
              </div>
              <div class="w-full h-[15px] rounded-t-lg bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-md" />
          </div>
          <!-- 第三名 -->
          <div class="flex flex-col items-center relative w-1/3 cursor-pointer" @click="openNovelDetail(rankItem(2)?._id || 0)">
              <div class="w-[90px] h-[115px] relative mb-2.5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-1">
                  <img
                    class="w-full h-full object-cover" 
                    :src="rankItem(2)?.cover_url || placeholderImage" 
                    :alt="rankItem(2)?.title || '加载中'" 
                    @error="handleImageError"
                  >
                  <div class="absolute bottom-0 left-0 right-0 p-2.5 text-xs bg-gradient-to-t from-black/80 to-transparent text-white">
                      <div>{{ rankItem(2)?.title || '加载中' }}</div>
                  </div>
              </div>
              <div class="w-full h-[10px] rounded-t-lg bg-gradient-to-r from-amber-700 to-amber-500 shadow-md" />
          </div>
      </div>
      
      <!-- 4-10名列表 -->
      <div class="px-4">
          <ul>
              <li 
                v-for="(index) in 7" 
                :key="index"
                class="text-white text-sm py-0.5 leading-normal text-left relative cursor-pointer transition-all duration-300 hover:translate-x-1 hover:text-yellow-400"
                @click="openNovelDetail(rankItem(index+2)?._id || 0)"
              >
                {{ index + 3 }}、{{ rankItem(index+2)?.title || '加载中' }}
              </li>
          </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Novel } from '~/types/novel/novelinfo';
  
  const props = defineProps({
      novels: {
          type: Array as () => Novel[],
          default: () => []
      },
  });
  
  const topNovels = computed(() => {
      // 确保novels不为空
      const result = props.novels?.length ? [...props.novels] : [];
      return result.slice(0, 10);
  });
  
  // 获取特定位置的排名小说，若不存在则返回一个包含默认值的对象
  const rankItem = (index: number) => {
    if (!topNovels.value || !topNovels.value[index]) {
      return {
        _id: `placeholder-${index}`,
        title: '加载中',
        cover_url: placeholderImage
      };
    }
    return topNovels.value[index];
  };
  
  const placeholderImage = 'https://placehold.co/200x300/cccccc/333333?text=加载中';
  
  // 在新窗口打开小说详情页
  const openNovelDetail = (id: number | string) => {
      // 检查ID是否为占位符ID
      if (!id || (typeof id === 'string' && id.startsWith('placeholder-'))) {
          return; // 不处理占位符ID或空ID的点击
      }
      
      localStorage.setItem('novelId', String(id));
      const path = `/novels/${id}`;
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.location.href = path;
      }
  };
  
  const handleImageError = (e: Event) => {
    if (e.target instanceof HTMLImageElement) {
      e.target.src = placeholderImage;
    }
  };
</script>