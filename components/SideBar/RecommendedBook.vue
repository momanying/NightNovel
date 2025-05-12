<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">NightFall今日推荐</h3>
    
    <div class="flex flex-col items-center text-center p-4 space-y-4">
      <div v-if="isLoading || !novel" class="flex items-center justify-center w-32 h-44">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
      </div>
      <img 
        v-else
        :src="coverImage" 
        :alt="novel.title" 
        class="w-32 h-44 object-cover rounded-md shadow-md" 
        @error="handleImageError"
      >

      <div class="text-white">
        <p class="font-bold text-lg">{{ novel?.title || '加载中...' }}</p>
        <p class="text-sm text-purple-200">作者：{{ novel?.author || '未知' }}</p>
      </div>

      <div class="flex gap-3 w-full justify-center">
        <button
          class="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-200"
          :disabled="isLoading || !novel"
          @click="emit('navigate', novelId)" 
        >
          开始阅读
        </button>
        <button 
          class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
          :disabled="isLoading"
          @click="fetchRandomNovel"
        >
          随机一本
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const props = defineProps<{
  novel?: Novel | null,
  loading?: boolean
}>();

const emit = defineEmits(['navigate', 'random']);
const { isLoading, getRandomNovel } = useRandomNovel();

// 计算小说封面图片
const coverImage = computed(() => {
  return props.novel?.cover_url || 'https://placehold.co/128x176/222/444?text=Loading';
});

// 计算小说ID
const novelId = computed(() => {
  if (!props.novel) return '';
  return props.novel.id || props.novel._id || '';
});

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://placehold.co/128x176/222/444?text=No+Image';
};

const fetchRandomNovel = async () => {
  const novel = await getRandomNovel();
  if (novel) {
    emit('random', novel);
  }
};

// 第一次加载时自动获取一本随机推荐
onMounted(() => {
  // 如果没有传入小说数据，则自动获取一本随机小说
  if (!novelId.value) {
    fetchRandomNovel();
  }
});
</script>
