<template>
  <CommentList :novel-id="currentNovelId" />
</template>

<script setup lang="ts">
import CommentList from '~/components/Comment/CommentList.vue';
import { useNovelStore } from '~/stores/novel';

const novelStore = useNovelStore();
const currentNovelId = computed(() => novelStore.currentNovelId as string);

</script>