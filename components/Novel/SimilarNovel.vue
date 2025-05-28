<template>
    <div v-if="similarNovels && similarNovels.length > 0" class="w-full">
        <h2 class="title-h2">同类推荐</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div v-for="novel in similarNovels" :key="novel.id" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
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
        const responseData = await $fetch<{ data: Novel[] }>('/api/novels/similar', {
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
