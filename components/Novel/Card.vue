<template>
    <div class="w-full text-white rounded-lg shadow-lg">
      <div v-if="props.novelinfo">
        <div class="flex">
          <div class="w-3/5">

             <NovelCardNovelInfo :novel="props.novelinfo"/>

          </div>
          <div class="w-2/5 ml-10">

              <NovelCardPopularComment />

          </div>  
        </div> 
      </div>
      <div v-else class="text-center py-10">
         <p>加载小说信息...</p>
      </div>
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
