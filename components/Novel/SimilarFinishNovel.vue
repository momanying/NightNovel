<template>
    <div class="w-full">
        <h2 class="title-h2">同类完本推荐</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="novel in similarNovels" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'

const novelStore = useNovelStore()
// 从store中获取响应式状态
const { currentNovel } = storeToRefs(novelStore)

const similarNovels = ref<Novel[]>([]);

const fetchSimilarNovels = async () => {
    if (!currentNovel.value || !currentNovel.value.tags) {
        similarNovels.value = [];
        return;
    }
    try {
        const params: Record<string, string> = {
            // Ensure tags are comma-separated for the API query
            tags: currentNovel.value.tags.trim().replace(/\s+/g, ',') || '',
        };
        if (currentNovel.value._id) {
            params.currentNovelId = currentNovel.value._id;
        }

        // Using $fetch directly returns the data or throws an error
        // The type <SimilarNovelsApiResponse> is applied to the resolved data
        const responseData = await $fetch<{ data: Novel[] }>('/api/novels/similarfinish', {
            query: params,
        });

        // $fetch throws an error on non-2xx responses, so no need for fetchError check here if not using try/catch for $fetch specifically
        // If responseData is available, it means the fetch was successful (2xx response)
        if (responseData && responseData.data) {
            similarNovels.value = responseData.data;
        } else {
            similarNovels.value = [];
            // console.warn('API response for similar novels lacks data or data array is missing:', responseData);
        }

    } catch (error) {
        // This catch block will now also catch errors from $fetch (e.g., 4xx, 5xx responses)
        console.error('Error in fetchSimilarNovels logic or $fetch failed:', error);
        similarNovels.value = [];
    }
};

watch(
    // Watch relevant fields from the currentNovel store state
    () => currentNovel.value ? { tags: currentNovel.value.tags, _id: currentNovel.value._id } : { tags: null, _id: null },
    fetchSimilarNovels,
    { immediate: true, deep: true }
);
</script>