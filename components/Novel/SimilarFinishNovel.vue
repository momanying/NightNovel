<template>
    <div v-if="isLoaded && novels.length > 0"  class="w-full">
        <h2 class="title-h2">同类完本推荐</h2>
        <div class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <NuxtLink v-for="novel in novels" :key="novel.id || novel._id" :to="`/novels/${novel.id}`" class="flex flex-col cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <div class="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-800">
                    <img 
                        :src="novel.cover_url" 
                        alt="小说封面" 
                        class="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                    >
                </div>
                <h3 class="text-sm font-medium text-white mt-1 truncate">{{ novel.title }}</h3>
                <p class="text-xs text-gray-400 truncate">{{ novel.author }}</p>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import { storeToRefs } from 'pinia';
import { useNovelStore } from '~/stores/novel';

const novelStore = useNovelStore();
const { currentNovel } = storeToRefs(novelStore);

const novelId = computed(() => currentNovel.value?._id || '');
const novelTags = computed(() => currentNovel.value?.tags || '');

const novels = ref<Novel[]>([]);
const isLoaded = ref(false);

const fetchSimilarNovels = async () => {
    if (!novelId.value || !novelTags.value) {
        novels.value = [];
        isLoaded.value = true;
        return;
    }

    const sessionStorageKey = `similarFinishNovels_${novelId.value}`;

    if (import.meta.client) {
        const cache = sessionStorage.getItem(sessionStorageKey);
        if (cache) {
            try {
                const parsed: Novel[] = JSON.parse(cache);
                novels.value = parsed;
                isLoaded.value = true;
                return;
            } catch (e) {
                console.error(`Failed to parse sessionStorage for ${sessionStorageKey}:`, e);
                sessionStorage.removeItem(sessionStorageKey);
            }
        }
    }

    try {
        const params = {
            tags: novelTags.value.trim().replace(/\s+/g, ','),
            currentNovelId: novelId.value,
        };

        const response = await $fetch<{ data: Novel[] }>('/api/novels/similarfinish', {
            query: params,
        });

        if (response && response.data) {
            novels.value = response.data;
            if (import.meta.client) {
                sessionStorage.setItem(sessionStorageKey, JSON.stringify(response.data));
            }
        } else {
            novels.value = [];
        }
    } catch (error) {
        console.error('Error fetching similar finish novels:', error);
        novels.value = [];
    } finally {
        isLoaded.value = true;
    }
};

watch([novelId, novelTags], ([newNovelId, newNovelTags], [oldNovelId, oldNovelTags]) => {
    if (newNovelId && newNovelTags) {
        if (newNovelId !== oldNovelId || newNovelTags !== oldNovelTags || !isLoaded.value) {
            novels.value = [];
            isLoaded.value = false;
            fetchSimilarNovels();
        }
    } else {
        novels.value = [];
        isLoaded.value = false;
    }
}, { immediate: true });

</script>