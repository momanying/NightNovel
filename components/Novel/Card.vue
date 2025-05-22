<template>
    <div class="w-full">

      <NovelCardNovelInfo :novel="props.novelinfo"/>

    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const props = defineProps<{
  novelinfo: Novel,
  autoplay?: boolean,
  interval?: number
}>()

</script>
