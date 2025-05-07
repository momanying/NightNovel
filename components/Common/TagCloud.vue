<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">热门标签</h3>
    <div v-if="!loading" class="flex flex-wrap gap-2 px-4 py-4">
      <a
        v-for="tag in props.tags" 
        :key="tag.id || tag.name"
        href="#"
        :style="{ fontSize: `${getTagSize(tag.count || tag.novelCount || 0)}px`, color: getTagColor(tag.id || tag.name) }"
        class="hover:scale-110 transition-transform duration-200"
        @click.prevent="$emit('navigate', tag.id || tag.name)"
      >
        {{ tag.name }}
      </a>
    </div>
    <div v-else class="flex justify-center py-4">
      <div class="w-6 h-6 border-2 border-t-transparent border-gray-300 rounded-full animate-spin" />
    </div>
    <p v-if="error" class="text-red-400 text-center py-2 px-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useTagStyles } from '~/composables/useTagStyles';
import type { Tag } from '~/types/tag';

const props = defineProps<{
  tags: Tag[],
  loading: boolean,
  error: string
}>();

const { tags } = toRefs(props);

// 使用 Composable 获取样式函数
const { getTagSize, getTagColor } = useTagStyles(tags);

defineEmits(['navigate']);

// // 移除本地的样式函数
// const getTagSize = (count: number) => { ... };
// const getTagColor = (id: number | string) => { ... };
</script> 