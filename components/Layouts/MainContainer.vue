<template>
<div class="w-full">
    <!-- 左侧内容区域，包含标题和轮播图 -->
     <div class="flex">
        <div class="flex flex-1 overflow-hidden flex-col">
          <!-- 轮播图区域 -->
          <div class="bg-sky-500/10 rounded-lg shadow-lg p-5">
            <MainCarousel :novels="props.featuredNovels" />
          </div>
        </div>
     </div>
    <!-- 更新小说区域 -->
     <div class="mt-10">
      <MainUpdateNovel :novels="props.featuredNovels" />
     </div>
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const props = defineProps({
  featuredNovels:{
    type: Array as () => Novel[],
    required: true,
  }
})
</script>