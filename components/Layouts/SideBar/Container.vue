<template>
  <div class="flex flex-col space-y-6 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-4">
    <!-- 推荐书籍组件 -->
    <LayoutsSideBarRecommendedBook
      class="w-full"
    />

    <!-- 排行榜组件 - 在移动设备上可以考虑特殊处理 -->
    <div class="w-full">
      <LayoutsSideBarRank 
        :novels="topNovels"
        class="w-full"
      />
    </div>

    <!-- 完结书籍组件 -->
    <LayoutsSideBarFinishBook
      :novels="finishNovels"
      class="w-full"
    />

    <!-- 新书组件 - 移除absolute定位 -->
    <LayoutsSideBarNewNovel class="w-full" />
  </div>
</template>
  
<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import type { ApiResponse } from '~/types/apiresponse';

const { data: topResponse } = await useFetch('/api/novels/top', {
    method: 'GET',
    query: { limit: 10 },
    key: 'top-novels',
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

const { data: finishResponse } = await useFetch<ApiResponse<Novel[]>>('/api/novels/finish',{
  method: 'GET',
  query: { limit: 12 }
})

const finishNovels = computed<Novel[]>(() => {
  if (finishResponse.value && 'data' in finishResponse.value && finishResponse.value.code === 200) {
    return finishResponse.value.data as Novel[]
  }
  return []
})
</script>