<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">NightFall今日推荐</h3>
    
    <div class="flex flex-col items-center text-center p-4 space-y-4">
      <div v-if="isLoading" class="flex items-center justify-center w-32 h-44">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
      <img 
        v-else
        :src="novel.cover" 
        :alt="novel.title" 
        class="w-32 h-44 object-cover rounded-md shadow-md" 
        @error="handleImageError"
      >

      <div class="text-white">
        <p class="font-bold text-lg">{{ novel.title }}</p>
        <p class="text-sm text-purple-200">作者：{{ novel.author }}</p>
      </div>

      <div class="flex gap-3 w-full justify-center">
        <button
          class="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-200"
          @click="emit('navigate', novel.id)" 
          :disabled="isLoading"
        >
          开始阅读
        </button>
        <button 
          class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
          @click="getRandomNovel" 
          :disabled="isLoading"
        >
          随机一本
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  novel: { id: number | string, title: string, author: string, cover: string },
  loading?: boolean
}>();

const emit = defineEmits(['navigate', 'random']);
const $api = useNuxtApp().$api;
const isLoading = ref(!!props.loading);

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://placehold.co/128x176/222/444?text=No+Image';
};

const getRandomNovel = async () => {
  isLoading.value = true;
  try {
    // 使用 any 类型来绕过类型检查
    const response: any = await $api.novel.getrecommond();
    if (response && response.data && response.data.novel) {
      emit('random', response.data.novel);
    }
  } catch (error) {
    console.error('获取随机小说失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 第一次加载时自动获取一本随机推荐
onMounted(() => {
  // 如果没有传入小说数据，则自动获取一本随机小说
  if (!props.novel.id) {
    getRandomNovel();
  }
});
</script>
