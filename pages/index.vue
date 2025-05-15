<template>
  <div class="gird h-screen w-screen">
    <LayoutsTheHeader />
    <div class="flex w-full mt-[30px]">
      <!-- 左侧栏 -->
      <div class="w-xs shrink-0 pl-7">
        <LayoutsLeftSidebar />
      </div>

      <!-- 主容器 -->
      <div class="flex-auto pl-5">
        <LayoutsMainContainer :featured-novels="featuredNovels" :top-novels="topNovels"/>
      </div>
    </div>
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
  query: { limit: 35 },
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
