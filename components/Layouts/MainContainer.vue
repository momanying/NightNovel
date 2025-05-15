<template>
<div class="w-full mr-5">
    <!-- 左侧内容区域，包含标题和轮播图 -->
     <div class="flex">
        <div class="flex flex-1 overflow-hidden flex-col w-[50px]">
          <!-- 轮播图区域 -->
          <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 block">高分作品</h2>
          <div class="flex flex-auto bg-gray-800 text-white rounded-lg shadow-lg mr-5">
            <MainCarousel :novels="props.topNovels" />
          </div>
        </div>

        <MainRank :novels="props.topNovels" />
     </div>
    <!-- 更新小说区域 -->
     <div class="mt-10">
      <MainNewNovel :novels="props.featuredNovels" />
     </div>

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