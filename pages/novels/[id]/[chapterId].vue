<template>
    <div class="max-w-4xl mx-auto px-4 py-8 border-2 mt-[20px]">
        <div v-if="chapterData" class="space-y-6">
            <!-- 章节标题 -->
            <h1 class="text-2xl font-bold text-center">{{ chapterData.chapter.title }}</h1>
            
            <!-- 导航按钮 -->
            <div class="flex justify-between items-center my-4">
                <button 
                    v-if="chapterData.prevChapter" 
                    @click="navigateToChapter(chapterData.prevChapter.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                >
                    上一章：{{ chapterData.prevChapter.title }}
                </button>
                <button 
                    v-if="chapterData.nextChapter" 
                    @click="navigateToChapter(chapterData.nextChapter.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                >
                    下一章：{{ chapterData.nextChapter.title }}
                </button>
            </div>

            <!-- 章节内容 -->
            <div class="chapter-content text-lg leading-relaxed">
                <p v-for="(paragraph, index) in contentParagraphs" 
                   :key="index" 
                   class="mb-6"
                >
                    {{ paragraph }}
                </p>
            </div>

            <!-- 底部导航按钮 -->
            <div class="flex justify-between items-center mt-8">
                <button 
                    v-if="chapterData.prevChapter" 
                    @click="navigateToChapter(chapterData.prevChapter.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                >
                    上一章：{{ chapterData.prevChapter.title }}
                </button>
                <button 
                    v-if="chapterData.nextChapter" 
                    @click="navigateToChapter(chapterData.nextChapter.id)"
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200"
                >
                    下一章：{{ chapterData.nextChapter.title }}
                </button>
            </div>
        </div>
        <div v-else-if="loading" class="text-center py-8">
            加载中...
        </div>
        <div v-else class="text-center py-8 text-red-500">
            {{ error || '加载失败' }}
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ChapterDetail } from '~/types/novel/chapter'

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const chapterData = ref<{
    chapter: ChapterDetail;
    prevChapter: { id: string; title: string; order: number } | null;
    nextChapter: { id: string; title: string; order: number } | null;
} | null>(null)

// 处理段落
const contentParagraphs = computed(() => {
    if (!chapterData.value?.chapter.content) return []
    return chapterData.value.chapter.content.split('\n\n').filter(p => p.trim())
})

const $api = useNuxtApp().$api

// 验证路由参数
const params = computed(() => {
    const id = route.params.id
    const chapterId = route.params.chapterId
    
    if (!id || id === 'undefined' || !chapterId || chapterId === 'undefined') {
        return null
    }
    return {
        id: id as string,
        chapterId: chapterId as string
    }
})

// 导航到指定章节
const navigateToChapter = (chapterId: string) => {
    if (!params.value?.id) return
    navigateTo(`/novels/${params.value.id}/${chapterId}`)
}

// 监听路由参数变化
watch([params], async ([newParams]) => {
    if (!newParams) {
        error.value = '无效的路由参数'
        return
    }
    
    loading.value = true
    error.value = null
    
    try {
        const response = await $api.novel.getChapter(newParams.id, newParams.chapterId)
        if (response.data) {
            chapterData.value = response.data
        }
    } catch (err) {
        error.value = '获取章节内容失败'
        console.error('获取章节内容失败:', err)
    } finally {
        loading.value = false
    }
}, { immediate: true })

// 键盘导航
onMounted(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
        if (!chapterData.value) return
        
        if (event.key === 'ArrowLeft' && chapterData.value.prevChapter) {
            navigateToChapter(chapterData.value.prevChapter.id)
        } else if (event.key === 'ArrowRight' && chapterData.value.nextChapter) {
            navigateToChapter(chapterData.value.nextChapter.id)
        }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    
    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyPress)
    })
})
</script>

<style scoped>
.chapter-content {
    min-height: 70vh;
}

.chapter-content p {
    text-indent: 2em;
    margin-bottom: 1.5em;
}
</style> 