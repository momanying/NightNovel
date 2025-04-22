<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">热门标签</h3>
    <div v-if="!loading" class="flex flex-wrap gap-2 px-4 py-4">
      <a
        v-for="tag in tags"
        :key="tag.id"
        href="#"
        :style="{ fontSize: `${getTagSize(tag.count)}px`, color: getTagColor(tag.id) }"
        class="hover:scale-110 transition-transform duration-200"
        @click.prevent="$emit('navigate', tag.id)"
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
const props = defineProps<{
  tags: { id: number | string, name: string, count: number }[],
  loading: boolean,
  error: string
}>();

defineEmits(['navigate']);

const getTagSize = (count: number) => {
  const max = Math.max(...props.tags.map(t => t.count));
  const min = Math.min(...props.tags.map(t => t.count));
  if (max === min) return 15;
  return 12 + ((count - min) / (max - min)) * 6;
};

const getTagColor = (id: number | string) => {
  const colors = ['#ff6600', '#00aaff', '#cc00cc', '#66ccff', '#ffcc00', '#99cc00', '#0099ff'];
  return colors[Number(id) % colors.length];
};
</script>
