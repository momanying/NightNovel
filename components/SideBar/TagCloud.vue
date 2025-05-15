<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">热门标签</h3>
    <div v-if="!loading" class="flex flex-wrap gap-2 px-4 py-4">
      <a
        v-for="tag in tags"
        :key="tag.name"
        href="#"
        :style="{ fontSize: `${getTagSize(tag.count)}px`, color: getTagColor(tag.name) }"
        class="hover:scale-110 transition-transform duration-200"
        @click.prevent="navigateToTag(tag.name)"
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
import { useTagCloud } from '~/composables/useTagCloud';

// 使用标签云组合式函数
const { tags, loading, error } = useTagCloud();

const navigateToTag = (tagName: string) => {
  navigateTo(`/novels/tag/${encodeURIComponent(tagName)}`);
};

const getTagSize = (count: number) => {
  if (!tags.value.length) return 15;
  
  const max = Math.max(...tags.value.map(t => t.count));
  const min = Math.min(...tags.value.map(t => t.count));
  
  if (max === min) return 15;
  return 14 + ((count - min) / (max - min)) * 8;
};

const getTagColor = (tagName: string) => {
  const colors = ['#ff6600', '#00aaff', '#cc00cc', '#66ccff', '#ffcc00', '#99cc00', '#0099ff'];
  
  // 使用字符串的哈希码作为颜色索引
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = ((hash << 5) - hash) + tagName.charCodeAt(i);
    hash |= 0; // 转换为32位整数
  }
  
  return colors[Math.abs(hash) % colors.length];
};
</script>

<style scoped>
.tag-cloud-enter-active,
.tag-cloud-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.tag-cloud-enter-from,
.tag-cloud-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
