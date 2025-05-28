<template>
    <div v-if="similarNovelsState.value && similarNovelsState.value.length > 0" class="w-full">
        <h2 class="title-h2">同类推荐</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="novel in similarNovelsState.value" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <NuxtLink :to="`/novels/${novel.id}`">
                    <NuxtImg :src="novel.cover_url || '/placeholder.jpg'" :alt="novel.title" class="aspect-[2/3] w-full object-cover rounded-md" densities="x1 x2" />
                    <h3 class="text-sm font-medium text-white mt-1 truncate">{{ novel.title }}</h3>
                    <p class="text-xs text-gray-400 truncate">{{ novel.author }}</p>
                </NuxtLink>
            </div>
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
const similarNovelsState = computed(() => useSimilarNovels(novelId.value))
const isLoaded = ref(false)

const fetchSimilarNovels = async () => {
  if (!currentNovel.value || !currentNovel.value.tags) return;
  
  const localStorageKey = `similarNovels_${novelId.value}`

  // 如果 useState 里已有值，直接用，不请求
  if (similarNovelsState.value.value.length > 0) {
    isLoaded.value = true
    return
  }

  // 如果 sessionStorage 有，加载进去
  if (import.meta.client) {
    const cache = sessionStorage.getItem(localStorageKey)
    if (cache) {
      try {
        const parsed: Novel[] = JSON.parse(cache)
        similarNovelsState.value.value = parsed
        isLoaded.value = true
        return
      } catch (e) {
        console.error('Failed to parse local cache', e)
      }
    }
  }

  // 没缓存才请求
  try {
    const params: Record<string, string> = {
      tags: currentNovel.value.tags.trim().replace(/\s+/g, ',') || '',
    }
    if (novelId.value) {
      params.currentNovelId = novelId.value
    }

    const { data, error } = await useFetch<{ data: Novel[] }>('/api/novels/similar', {
      query: params,
    })

    if (error.value) throw error.value
    if (data.value && data.value.data) {
      similarNovelsState.value.value = data.value.data
      // 存入 localStorage
      if (import.meta.client) {
        sessionStorage.setItem(localStorageKey, JSON.stringify(data.value.data))
      }
    } else {
      similarNovelsState.value.value = []
    }
  } catch (err) {
    console.error('Fetch failed:', err)
    similarNovelsState.value.value = []
  } finally {
    isLoaded.value = true
  }
}

// 监听 novelId 变化，触发一次
watch(() => novelId.value, (newId) => {
  if (newId) fetchSimilarNovels()
}, { immediate: true })
</script>
