<template>
<div>

  <LayoutsHeaderContainer />

  <div class="mx-40 p-2.5 mt-5">
    

    <NovelInfomation v-if="currentNovel" :novel="currentNovel" />


    <div class="mt-5 flex">

      <div class="max-h-full">
            
        <NovelSimilarNovel />

        <NovelSimilarFinishNovel :novel="currentNovel" />

      </div>

      <div class="ml-10 flex-grow max-w-[500px]">

        <NovelPopularComment />
        
      </div>
      
    </div>
    
    <NovelComment />

  </div> 
</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'

const route = useRoute()
const novelId = computed(() => route.params.id as string)
const novelStore = useNovelStore()

// 从store中获取响应式状态
const { currentNovel } = storeToRefs(novelStore)

useHead({
  title: currentNovel.value?.title || '小说详情',
  meta: [
    {
      name: 'title',
    },
  ],
})

// 监听novelId变化，获取小说数据
watch(novelId, async (newId) => {
  if (newId) {
    await novelStore.fetchNovelData(newId)
  }
}, { immediate: true })
</script>