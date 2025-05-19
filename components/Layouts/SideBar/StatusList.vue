<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-md">
    <h3 class="bg-gray-700 text-white font-medium text-lg py-3 px-4">小说状态</h3>
    <ul v-if="!loading" class="space-y-3 px-4 py-3">
      <li v-for="s in statuses" :key="s.id">
        <a 
          href="#"
          class="flex justify-between items-center text-gray-200 hover:text-orange-400 transition duration-200" 
          @click.prevent="$emit('navigate', s.type)" 
          
        >
          {{ s.name }} 
          <span class="text-sm text-purple-300">({{ s.count }})</span>
        </a>
      </li>
    </ul>
    <div v-else class="flex justify-center py-4">
      <div class="w-6 h-6 border-2 border-t-transparent border-gray-300 rounded-full animate-spin" />
    </div>
    <p v-if="error" class="text-red-400 text-center py-2 px-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  statuses: { id: number | string, name: string, type: string, count: number }[],
  loading: boolean,
  error: string
}>();

defineEmits(['navigate']);
</script>
