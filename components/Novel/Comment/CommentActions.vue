<template>
  <div class="flex items-center">
    <button class="flex text-sm text-blue-300 hover:text-primary-500 mr-3" @click="$emit('like')">
      <font-awesome-icon 
        :icon="isLiked ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" 
        :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" 
      />
      {{ likes || 0 }}
    </button>
    <button class="flex text-sm text-blue-300 hover:text-primary-500" @click="$emit('reply')">
      <font-awesome-icon :icon="['fas', 'comment']" :style="{ width: '1rem', height: '1rem', marginRight: '0.3rem' }" />
      回复
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  likes?: number;
  isLiked?: boolean;
}>();

defineEmits(['like', 'reply']);
</script> 