<template>
  <nav class="flex items-center text-sm text-gray-400 dark:text-gray-500 mb-4">
    <ul class="flex flex-wrap items-center">
      <li class="inline-flex items-center">
        <NuxtLink to="/" class="hover:text-primary-500 transition-colors">
          <Icon name="ph:house" class="w-4 h-4 mr-1" />
          首页
        </NuxtLink>
      </li>
      
      <li v-for="(item, index) in items" :key="index" class="flex items-center">
        <span class="mx-2">/</span>
        <NuxtLink 
          v-if="item.path && item.path !== '' && index < items.length - 1" 
          :to="item.path" 
          class="hover:text-primary-500 transition-colors"
        >
          {{ item.name }}
        </NuxtLink>
        <span 
          v-else 
          class="text-gray-200 dark:text-gray-300 font-medium"
        >
          {{ item.name }}
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  name: string;
  path?: string;
}

defineProps({
  items: {
    type: Array as () => BreadcrumbItem[],
    required: true,
  }
});
</script> 