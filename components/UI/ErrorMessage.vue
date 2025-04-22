<template>
    <div class="text-red-400 text-center py-4 text-sm">{{ message }}</div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    message: string
  }>()
  </script>