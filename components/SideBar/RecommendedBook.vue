<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">NightFall今日推荐</h3>
    
    <div class="flex flex-col items-center text-center p-4 space-y-4">
      <img 
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
        >
          开始阅读
        </button>
        <button 
          class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
          @click="onRandom" 
        >
          随机一本
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  novel: { id: number | string, title: string, author: string, cover: string },
  loading: boolean
}>();

const emit = defineEmits(['navigate', 'random']);

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://placehold.co/128x176/222/444?text=No+Image';
};

const onRandom = () => {
  // 实现随机功能
  emit('random');
};
</script>
