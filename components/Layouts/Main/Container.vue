<template>
<div class="w-full">

    <div class="flex">
      <div class="flex flex-1 overflow-hidden flex-col">
        <div class="bg-sky-500/10 rounded-lg shadow-lg p-5">
          <LayoutsMainCarousel :novels="bestNovels" />
        </div>
      </div>
    </div>

    <LayoutsMainUpdateNovel :novels="featuredNovels" />

    <LayoutsMainFinishNovel :novels="finishNovels" />

</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import type { ApiResponse } from '~/types/apiresponse';

// 获取最新小说
const { data: latestResponse } = await useFetch('/api/novels/latest', {
  method: 'GET',
  query: { limit: 12 }
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
  query: { limit: 12 }
});

const bestNovels = computed<Novel[]>(() => {
  if (bestResponse.value && 'data' in bestResponse.value && bestResponse.value.code === 200) {
    return bestResponse.value.data as Novel[]
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