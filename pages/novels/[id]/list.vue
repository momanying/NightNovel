<template>
    <div class="w-full border-2 h-full">
        <LayoutsTheHeader />
        <div class="mx-8 my-6">
            <h1 
                class="text-2xl font-bold mb-6" 
                >{{ currentNovel?.title }}
            </h1>
            
            <div v-if="loadingNovel" class="flex justify-center items-center h-[200px]">
                <span class="text-lg">加载中...</span>
            </div>
            
            <div v-else-if="novelError" class="flex justify-center items-center h-[200px]">
                <span class="text-red-500">{{ novelError }}</span>
            </div>
            
            <div v-else-if="novelVolumes.length === 0" class="flex justify-center items-center h-[200px]">
                <span class="text-gray-500">暂无章节数据</span>
            </div>
            
            <div v-else>
                <div v-for="volume in novelVolumes" :key="volume._id" class="mb-8">
                    <div class="border-b pb-2 mb-4">
                        <h2 class="title-h2">{{ volume.title }}</h2>
                    </div>
                    
                    <div v-if="volume.chapters && volume.chapters.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div 
                            v-for="chapter in volume.chapters" 
                            :key="chapter._id" 
                            class="p-3 border rounded hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                            @click="handleChapterClick(chapter._id)">
                            <div class="flex justify-between items-center">
                                <span class="truncate">{{ chapter.title }}</span>
                                <span class="text-sm text-gray-400 ml-2 whitespace-nowrap">{{ chapter.word_count }}字</span>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else class="text-gray-500 p-3">
                        该卷暂无章节
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'

const route = useRoute();
const router = useRouter();
const novelId = computed(() => {
    const id = route.params.id;
    if (!id || id === 'undefined') {
        return null;
    }
    return id as string;
});

// 使用novel store
const novelStore = useNovelStore();
const { currentNovel, novelVolumes, loadingNovel, novelError } = storeToRefs(novelStore);

// 章节点击处理
const handleChapterClick = (chapterId: string) => {
    if (!novelId.value || !chapterId) return;
    navigateTo(`/novels/${novelId.value}/${chapterId}`);
};

// 监听novelId变化，获取小说数据
watch(novelId, async (newId) => {
    if (!newId) {
        router.push('/novels');
    } else {
        await novelStore.fetchNovelData(newId);
    }
}, { immediate: true });

// SEO优化
useHead({
    title: currentNovel.value ? `${currentNovel.value.title} - 章节列表` : '小说章节列表',
    meta: [
        { name: 'description', content: currentNovel.value ? `${currentNovel.value.title}的所有章节列表` : '浏览小说的所有章节' }
    ]
});
</script>