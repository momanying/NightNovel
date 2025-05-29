<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">新书榜</h3>
    <div class="px-4">
      <ul>
        <li 
          v-for="(novel, index) in featuredNovels.slice(0,10)" 
          :key="novel._id"
          class="truncate text-white text-sm py-0.5 leading-normal text-left relative cursor-pointer transition-all duration-300 hover:translate-x-1 hover:text-yellow-400
          border-b border-dashed border-gray-700"
          @click="openNovelDetail(novel._id)"
        >
          {{ index + 1 }}、{{ novel.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const { data: latestResponse } = await useFetch('/api/novels/newnovel', {
  method: 'GET',
  key: 'new-novels',
  transform: (response) => {
    return response
  }
});

const featuredNovels = computed<Novel[]>(() => {
  if (latestResponse.value && 'data' in latestResponse.value) {
    return latestResponse.value.data as Novel[]
  }
  return []
});

const openNovelDetail = (id: string | undefined) => {
  if (!id) return;
  
  localStorage.setItem('novelId', String(id));
  const path = `/novels/${id}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};
</script>
