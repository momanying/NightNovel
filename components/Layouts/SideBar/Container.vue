<template>
  <div class="flex flex-col space-y-7 rounded-r-lg shadow-lg relative h-full">

    <LayoutsSideBarRecommendedBook
      class="w-full"
    />

    <LayoutsSideBarRank :novels="topNovels"/>

    <LayoutsSideBarPersonList
      class="w-full"
    />

    <LayoutsSideBarNewNovel class="w-full absolute bottom-0" />
  </div>
</template>

  
<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

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
</script>