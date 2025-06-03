<template>
  <div class="top-16 z-20">
    <div class="bg-gray-900/60 backdrop-blur-sm border-t border-b border-gray-800/50">
      <div class="container mx-auto">
        <ul class="flex space-x-8 overflow-x-auto whitespace-nowrap px-4 py-3">
          <li 
            v-for="tab in tabs" 
            :key="tab.id" 
            @click="$emit('change', tab.id)"
            class="cursor-pointer transition-colors duration-200 relative py-2 px-1"
            :class="[
              activeTab === tab.id 
                ? 'text-sky-500 font-medium' 
                : 'text-gray-300 hover:text-gray-100'
            ]"
          >
            <span>{{ tab.label }}</span>
            <div 
              v-if="activeTab === tab.id" 
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full"
            ></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  tabs: {
    type: Array as () => Array<{id: string, label: string}>,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
});

defineEmits(['change']);
</script>