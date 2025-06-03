<template>
    <div class="w-full">
        <h2 class="title-h2">同类完本推荐</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <NuxtLink v-for="novel in novels" :key="novel._id" :to="`/novels/${novel._id}`" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <div class="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-800">
                    <img 
                        :src="novel.cover_url" 
                        alt="小说封面" 
                        class="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                    >
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <h3 class="text-sm font-medium text-white">{{ novel.title }}</h3>
                    </div>
                </div>
                <h3 class="text-sm font-medium text-white mt-1 truncate">{{ novel.title }}</h3>
                <p class="text-xs text-gray-400 truncate">{{ novel.author }}</p>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'

const novelStore = useNovelStore()
const { currentNovel } = storeToRefs(novelStore)

const novelId = computed(() => currentNovel.value?._id || '')
const { novels, set: setNovels, clear: clearNovels } = useSimilarFinishNovels(novelId.value)
const isLoaded = ref(false)

const fetchSimilarNovels = async () => {
    if (!currentNovel.value || !currentNovel.value.tags) return;

    const sessionStorageKey = `similarFinishNovels_${novelId.value}`

    // 如果已有值，直接用，不请求
    if (novels.value.length > 0) {
        isLoaded.value = true
        return
    }

    if (import.meta.client) {
        const cache = sessionStorage.getItem(sessionStorageKey)
        if (cache) {
            const parsed: Novel[] = JSON.parse(cache)
            setNovels(parsed)
            isLoaded.value = true
            return
        }
    }

    const params: Record<string, string> = {
        tags: currentNovel.value.tags.trim().replace(/\s+/g, ',') || '',
    }
    if (novelId.value) {
        params.currentNovelId = novelId.value
    }

    const { data, error } = await useFetch<{ data: Novel[] }>('/api/novels/similarfinish', {
        query: params,
    })

    if (error.value) throw error.value
    if (data.value && data.value.data) {
        setNovels(data.value.data)
        // 存入 localStorage
        if (import.meta.client) {
            sessionStorage.setItem(sessionStorageKey, JSON.stringify(data.value.data))
        }
    } else {
        clearNovels()
    }
} 
// 监听 novelId 变化，触发一次
watch(() => novelId.value, (newId) => {
  if (newId) fetchSimilarNovels()
}, { immediate: true })
</script>