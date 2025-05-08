<template>
    <div class="w-full border-2 h-full">
        <div v-for="volume in volumes" :key="volume._id">
            <div class="border-2 h-full mx-[50px] my-[50px] flex">
                <div class="w-[30%] p-4">
                    <h2 class="title-h2">{{ volume.title }}</h2>
                    <img src="http://img.wenku8.com/image/3/3057/3057s.jpg" alt="novel-cover" class="">
                </div>
                <div v-if="volume.chapters" class="my-1 grid grid-cols-5 gap-5 ">
                    <div v-for="chapter in volume.chapters" :key="chapter._id" class="p-2 hover:bg-gray-700" @click="handleChapterClick(chapter._id)">
                        {{ chapter.title }}
                        <span class="text-sm text-gray-400">{{ chapter.word_count }}字</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Volume } from '~/types/novel/volume';

const $api = useNuxtApp().$api
const router = useRouter()
const volumes = ref<Volume[]>([])
const route = useRoute()

// 验证路由参数
const params = computed(() => {
    const id = route.params.id
    
    if (!id || id === 'undefined') {
        return null
    }
    return {
        id: id as string
    }
})

// 监听路由参数变化
watch(params, (newParams) => {
    if (!newParams) {
        router.push('/novels')
    }
}, { immediate: true })

const handleChapterClick = (chapterId: string) => {
    if (!params.value?.id || !chapterId) return
    navigateTo(`/novels/${params.value.id}/${chapterId}`)
}

onMounted(async () => {
    if (!params.value) return
    
    try {
        const response = await $api.novel.getNovelById(params.value.id)
        if(response.data?.volumes){
            volumes.value = response.data.volumes
        }
    } catch (error) {
        console.error('获取小说章节列表失败:', error)
        // 可以添加错误提示
    }
})
</script>