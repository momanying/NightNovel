<template>
<div class="w-full h-full">
  <div class="flex h-[400px]">
    <div class="h-full w-[800px]">
      <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4">高分作品</h2>
      <!-- 轮播图区域 -->
      <MainCarousel :novels="featuredNovels" />
    </div>

    <!-- 人气排行 -->
    <div>
      <MainRank :novels="topNovels" />
    </div>
  </div>

  <!-- 更新小说区域 -->
  <MainNewNovel :novels="featuredNovels" />
</div>
</template>

<script setup lang="ts">
import type { Novel } from '@/types/novel/novel';
const $api = useNuxtApp().$api

const featuredNovels = ref<Novel[]>([]);
const topNovels = ref<Novel[]>([]);

onMounted(async () => {
  try {
    // 获取热门小说
    const topResponse = await $api.novel.getTop(10);
    if (topResponse && topResponse.data) {
      topNovels.value = topResponse.data;
    }
    
    // 获取最新小说
    const latestResponse = await $api.novel.getLatest(12);
    if (latestResponse && latestResponse.data) {
      featuredNovels.value = latestResponse.data;
    }
  } catch (error) {
    console.error('获取小说数据失败:', error);
  }
});
</script>