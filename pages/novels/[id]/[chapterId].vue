<template>
    <div>
        <LayoutsTheHeader />
        <div class="mx-auto max-w-4xl px-4 py-8 mt-4 bg-gray-900 rounded-lg">
            <div v-if="currentNovel" class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">{{ currentNovel.title }}</h3>
                    <NuxtLink :to="`/novels/${novelId}/list`" class="text-sm text-gray-400 hover:text-gray-300">
                        返回目录
                    </NuxtLink>
                </div>
            </div>
            
            <div v-if="currentChapter" class="space-y-6">
                <!-- 章节标题 -->
                <h1 class="text-2xl font-bold text-center">{{ currentChapter.title }}</h1>
                <!-- 章节内容 -->
                <div class="min-height-[70vh] text-lg leading-relaxed">
                    <p
                        v-for="(paragraph, index) in contentParagraphs" 
                        :key="index" 
                        class="mb-[1.5rem] text-indent-[2rem]"
                    >
                        {{ paragraph }}
                    </p>
                </div>

                <!-- 底部导航按钮 -->
                <div class="flex justify-between items-center mt-8">
                    <button 
                        v-if="prevChapter" 
                        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                        @click="navigateToChapter(prevChapter.id)"
                    >
                        上一章：{{ prevChapter.title }}
                    </button>
                    <div v-else class="w-24"></div>
                    
                    <button 
                        v-if="nextChapter" 
                        class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                        @click="navigateToChapter(nextChapter.id)"
                    >
                        下一章：{{ nextChapter.title }}
                    </button>
                    <div v-else class="w-24"></div>
                </div>
            </div>
            <div v-else-if="loadingChapter" class="text-center py-8">
                加载中...
            </div>
            <div v-else-if="chapterError" class="text-center py-8 text-red-500">
                {{ chapterError }}
            </div>
            <div v-else class="text-center py-8 text-red-500">
                章节加载失败
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'
import type { ChapterDetail } from '~/types/novel/chapter'
import type { ApiResponse } from '~/types/auth/index'

const route = useRoute()
const novelId = computed(() => route.params.id as string)
const chapterId = computed(() => route.params.chapterId as string)

// 使用novel store
const novelStore = useNovelStore()
const { 
    currentNovel, 
    currentChapter, 
    prevChapter, 
    nextChapter, 
    loadingChapter, 
    chapterError 
} = storeToRefs(novelStore)

// 处理段落
const contentParagraphs = computed(() => {
    if (!currentChapter.value?.content) return []
    return currentChapter.value.content.split('\n\n').filter(p => p.trim())
})

// 导航到指定章节
const navigateToChapter = (nextChapterId: string) => {
    if (!novelId.value) return
    navigateTo(`/novels/${novelId.value}/${nextChapterId}`)
}

// 加载章节内容
const loadChapterContent = async () => {
    if (!novelId.value || !chapterId.value) return
    
    await novelStore.fetchChapterContent(novelId.value, chapterId.value)
    
    // 更新页面标题
    if (currentNovel.value && currentChapter.value) {
        useHead({
            title: `${currentNovel.value.title} - ${currentChapter.value.title}`,
            meta: [
                { name: 'description', content: `正在阅读${currentNovel.value.title}的${currentChapter.value.title}` }
            ]
        })
    }
}

// 监听路由参数变化
watch([novelId, chapterId], () => {
    loadChapterContent()
}, { immediate: true })

// 键盘导航
onMounted(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
        if (!prevChapter.value && !nextChapter.value) return
        
        if (event.key === 'ArrowLeft' && prevChapter.value) {
            navigateToChapter(prevChapter.value.id)
        } else if (event.key === 'ArrowRight' && nextChapter.value) {
            navigateToChapter(nextChapter.value.id)
        }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyPress)
    })
})
</script>