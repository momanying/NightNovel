<template>
<div class="w-full">
    <!-- 左侧内容区域，包含标题和轮播图 -->
     <div class="flex">
        <div class="flex flex-1 overflow-hidden flex-col">
          <!-- 轮播图区域 -->
          <div class="bg-sky-500/10 rounded-lg shadow-lg p-5">
            <LayoutsMainCarousel :novels="bestNovels" />
          </div>
        </div>
     </div>
    <!-- 更新小说区域 -->
     <div class="mt-10">
      <LayoutsMainUpdateNovel :novels="featuredNovels" />
     </div>
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

// 获取最新小说
const { data: latestResponse } = await useFetch('/api/novels/latest', {
  method: 'GET',
  query: { limit: 18 }
});


const featuredNovels = computed<Novel[]>(() => {
  if (latestResponse.value && 'data' in latestResponse.value && latestResponse.value.code === 200) {
    return latestResponse.value.data as Novel[]
  }
  return []
});

// 获取推荐小说
const { data: bestResponse } = await useFetch('/api/novels/best', {
  method: 'GET',
  query: { limit: 18 }
});

const bestNovels = computed<Novel[]>(() => {
  if (bestResponse.value && 'data' in bestResponse.value && bestResponse.value.code === 200) {
    return bestResponse.value.data as unknown as Novel[]
  }
  return []
});
</script>