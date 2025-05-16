<template>
  <div>
    <LayoutsTheHeader />
    <!-- 默认垂直堆叠，md及以上水平排列 -->
    <div class="mx-[50px] my-[20px]">
      <div class="flex relative">
        <div class="md:flex-auto mr-10">
          <LayoutsMainContainer :featured-novels="featuredNovels"/>
        </div>
        <!-- 小屏幕: w-full, 大屏幕: md:w-xs (或具体宽度如 md:w-64), 适当调整边距 -->
        <div class="w-full md:w-sm md:shrink-0 mb-6 md:mb-0 md:pr-5 lg:pr-7">
          <LayoutsLeftSidebar  :top-novels="topNovels"/>
        </div>
      </div>      <!-- 小屏幕: w-full, 大屏幕: md:flex-auto -->
    </div>

    <LayoutsFooter />
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

// 获取热门小说
const { data: topResponse } = await useFetch('/api/novels/top', {
  method: 'GET',
  query: { limit: 10 },
  key: 'top-novels',
  transform: (response) => {
    return response
  }
});

// 获取最新小说
const { data: latestResponse } = await useFetch('/api/novels/latest', {
  method: 'GET',
  query: { limit: 18 },
  key: 'latest-novels',
  transform: (response) => {
    return response
  }
});

// 处理响应数据
const topNovels = computed<Novel[]>(() => {
  if (topResponse.value && 'data' in topResponse.value && topResponse.value.code === 200) {
    return topResponse.value.data as Novel[]
  }
  return []
});

const featuredNovels = computed<Novel[]>(() => {
  if (latestResponse.value && 'data' in latestResponse.value && latestResponse.value.code === 200) {
    return latestResponse.value.data as Novel[]
  }
  return []
});
</script>
