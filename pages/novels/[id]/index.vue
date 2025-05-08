<template>
<div>
  <LayoutsTheHeader />
  <div class="mx-30 p-2.5">
    <div class="flex gap-5 mt-5">

      <NovelCard :novelinfo="novelinfo" />

    </div>
    <div class="flex mt-5 justify-between">
      <div>
        <NovelSameNovel />
      </div>
      <div>
        <NovelSimilarNovel />
      </div>
    </div>
  </div> 
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const $api = useNuxtApp().$api

const novelinfo = ref<Novel>({} as Novel)
const route = useRoute()

onMounted(async () => {
  try{
    const inforesponse = await $api.novel.getNovelById(route.params.id as string)
    if(inforesponse.data){
      novelinfo.value = inforesponse.data.novel
    }
  }catch(error){
    console.error('获取小说信息失败:', error)
  }
})
</script>