<template>
    <div>
        <h1 class="text-2xl font-bold mb-5">{{ novel.title }}</h1>
        <div class="flex">
        <div class="flex-shrink-0 mr-5">
            <img :src="novel.cover_url" :alt="novel.title" class="h-full w-full rounded-md shadow-md">
        </div>
        <div class="flex-1 relative">
            <p class="mb-1"><span class="font-semibold">作者：</span>{{ novel.author }}</p>
            <p class="mb-1"><span class="font-semibold">分类：</span>{{ novel.category }}</p>
            <p class="mb-1"><span class="font-semibold">状态：</span>{{ novel.status || '连载中' }}</p>
            <p class="mb-1">
                <span class="font-semibold">评分：</span>
                <NovelCardEvaluation class="inline-block align-baseline" :rating="novel.rating" />
            </p>
            <p class="mb-1"><span class="font-semibold">阅读量：</span>{{ novel.views || 0 }}</p>
            <p class="mb-1"><span class="font-semibold">更新时间：</span>{{ novel.lastUpdate || '暂无更新时间' }}</p>
            <div class="mt-2">
            <span class="font-semibold block">标签：</span>
            <template v-if="tagLoading">加载中...</template>
            <template v-else-if="tagError">{{ tagError }}</template>
            <template v-else-if="tagList && tagList.length > 0">
                <a
                v-for="tag in tagList"
                :key="tag"
                href="#"
                class="inline-block mr-2 px-1 py-1 rounded text-sm hover:scale-105 transition-transform duration-200"
                @click.prevent="navigateToTag(tag)"
                >
                <font-awesome-icon :icon="['fas', 'tags']" :style="{height: '20px', width: '20px'}" />{{ tag }}
                </a>
            </template>
            <template v-else>暂无标签</template>
            </div>
            <div class="flex gap-4 absolute bottom-0">
                <button class="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition duration-200" @click="navigateToChapters">开始阅读</button>
                <button class="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200" @click="toggleCollect">{{ isCollected ? '已收藏' : '加入书架' }}</button>
            </div>
        </div>
        </div>  
    </div>
    <div class="mt-4">
        <h3 class="text-xl font-semibold mb-3">简介</h3>
        <p class="text-gray-300 leading-relaxed">{{ novel.introduction || '暂无简介' }}</p>
    </div>   
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo'

const props = defineProps<{
    novel: Novel
}>()

const tagList = computed(() => {
    return props.novel && props.novel.tags 
      ? props.novel.tags.split(' ').filter(Boolean)
      : []
})

const tagLoading = ref(false)
const tagError = ref<string | null>(null)

const isCollected = ref(false)

// 导航到章节列表页面
const navigateToChapters = () => {
  if (!props.novel._id) return
  navigateTo(`/novels/${props.novel._id}/list`);
};

// 切换收藏状态
const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  // 实际应用中应调用API保存收藏状态
};

// 导航到标签页面
const navigateToTag = (tagId: string | number) => {
  navigateTo(`/tags/${tagId}`);
};
</script>