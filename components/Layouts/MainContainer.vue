<template>
<div class="w-full h-full">
  <div class="flex h-[400px]">
    <div class="h-full w-[800px]">
      <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4">高分作品</h2>
      <!-- 轮播图区域 -->
      <MainCarousel :novels="props.topNovels" />
    </div>

    <!-- 人气排行 -->
    <div>
      <MainRank :novels="props.topNovels" />
    </div>
  </div>

  <!-- 更新小说区域 -->
  <MainNewNovel :novels="props.featuredNovels" />
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const props = defineProps({
  featuredNovels:{
    type: Array as () => Novel[],
    required: true,
  },
  topNovels:{
    type: Array as () => Novel[],
    required: true
  }
})
</script>