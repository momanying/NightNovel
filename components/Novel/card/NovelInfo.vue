<template>
    <div>
        <h1 class="text-2xl font-bold mb-5">{{ novel.title }}</h1>
        <div class="flex">
        <div class="flex-shrink-0 mr-5">
            <img :src="novel.cover" :alt="novel.title" class="h-full w-full rounded-md shadow-md">
        </div>
        <div class="flex-1">
            <p class="mb-2"><span class="font-semibold">作者：</span>{{ novel.author }}</p>
            <p class="mb-2"><span class="font-semibold">分类：</span>{{ novel.category }}</p>
            <p class="mb-2"><span class="font-semibold">状态：</span>{{ novel.status || '连载中' }}</p>
            <p class="mb-2">
                <span class="font-semibold">评分：</span>
                <NovelCardEvaluation class="inline-block align-baseline" :rating="novel.rating" />
            </p>
            <p class="mb-2"><span class="font-semibold">阅读量：</span>{{ novel.views || 0 }}</p>
            <p class="mb-2"><span class="font-semibold">更新时间：</span>{{ novel.updateTime || '暂无更新时间' }}</p>
            <div class="mb-4">
            <span class="font-semibold block">标签：</span>
            <template v-if="tagLoading">加载中...</template>
            <template v-else-if="tagError">{{ tagError }}</template>
            <template v-else-if="novel.tags && novel.tags.length > 0">
                <a
                v-for="tag in novel.tags"
                :key="tag.id"
                href="#"
                style="font-size: 10px; padding: 5px;"
                class="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-sm hover:scale-105 transition-transform duration-200"
                @click.prevent="navigateToTag(tag.id)"
                >
                <font-awesome-icon :icon="['fas', 'tags']" />{{ tag.name }}
                </a>
            </template>
            <template v-else>暂无标签</template>
            </div>
            <div class="flex gap-4">
                <button class="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition duration-200" @click="navigateToChapters">开始阅读</button>
                <button class="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200" @click="toggleCollect">{{ isCollected ? '已收藏' : '加入书架' }}</button>
            </div>
        </div>
        </div>  
    </div>
    <div class="mt-4">
        <h3 class="text-xl font-semibold mb-3">简介</h3>
        <p class="text-gray-300 leading-relaxed">{{ novel.description || '暂无简介' }}</p>
    </div>   
</template>

<script setup>
defineProps({
    novel: {
        type: Object,
        required: true
    }
})

const tagLoading = ref(false)
const tagError = ref(null)

const isCollected = ref(false)

// 导航到章节列表页面
const navigateToChapters = () => {
  navigateTo(`/novels/${novelId}/`);
};

// 切换收藏状态
const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  // 实际应用中应调用API保存收藏状态
};

// 导航到标签页面
const navigateToTag = (tagId) => {
  navigateTo(`/tags/${tagId}`);
};
</script>