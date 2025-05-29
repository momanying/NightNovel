<template>
  <div class="border rounded-lg overflow-hidden">
    <div class="flex flex-col h-full">
      <!-- 小说封面和信息改为上下布局 -->
      <div class="flex p-4">
        <!-- 小说封面 -->
        <div class="flex-shrink-0">
          <NuxtImg 
            :src="novel.cover_url" 
            :alt="novel.title" 
            class="h-32 object-cover rounded-md shadow-md"
            width="90"
            height="120"
            loading="lazy"
          />
        </div>

        <!-- 小说基本信息 -->
        <div class="w-3/4 pl-4">
          <!-- 标题和作者 -->
          <h2 class="text-base font-semibold text-blue-800 hover:text-blue-600 mb-1">
            <NuxtLink :to="`/novels/${novel._id}`">{{ novel.title }}</NuxtLink>
          </h2>
          <div class="text-xs text-white">
            作者：<span>{{ novel.author }}</span>
          </div>
          <div class="text-xs text-white">
            分类：<NuxtLink :to="`/articlelist?category=${novel.category}`" class="hover:text-blue-500">{{ novel.category }}</NuxtLink>
          </div>
          
          <!-- 更新信息 -->
          <div class="text-xs text-white mt-1">
            更新：{{ novel.lastUpdate || '暂无更新' }}/字数：{{ novel.word_count || 0 }}
            <div>{{ novel.status || '连载中' }}<span v-if="novel.animation" class="text-red-500 ml-1">/已动画化</span></div>
          </div>
        </div>
      </div>
      
      <div class="px-4 pb-4">
        <!-- 标签 -->
        <div class="mb-2">
          <template v-if="novel.tags && typeof novel.tags === 'string'">
            <p 
              v-for="(tag, index) in novel.tags.split(',').slice(0, 4)" 
              :key="index"
              :to="`/tags/${tag}`" 
              class="inline-block text-xs bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1"
            >
              {{ tag }}
            </p>
          </template>
          <template v-else-if="novel.tags && Array.isArray(novel.tags)">
            <p 
              v-for="(tag, index) in novel.tags.slice(0, 4)" 
              :key="index"
              :to="`/tags/${tag}`" 
              class="inline-block text-xs bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1"
            >
              {{ tag }}
            </p>
          </template>
        </div>

        <!-- 简介 -->
        <div class="text-xs text-gray-300 mb-3 line-clamp-2">
          {{ novel.introduction || '暂无简介' }}
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-1 text-xs">
          <NuxtLink :to="`/novels/${novel._id}`" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            阅读
          </NuxtLink>
          <button class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" @click="addToBookshelf(novel._id)">
            收藏
          </button>
          <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="recommendNovel(novel._id)">
            推荐
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo'; // Assuming Novel type is globally available or adjust path

interface Props {
  novel: Novel;
}

defineProps<Props>();

// Dummy methods for now, actual implementation might involve emitting events or calling a store action
const addToBookshelf = (novelId: string | undefined) => {
  if (!novelId) return;
  console.log('Adding to bookshelf:', novelId);
  // Emit an event or call a Pinia store action here
};

const recommendNovel = (novelId: string | undefined) => {
  if (!novelId) return;
  console.log('Recommending novel:', novelId);
  // Emit an event or call a Pinia store action here
};
</script> 