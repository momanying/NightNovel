<template>
<div>

  <LayoutsHeaderContainer />

  <div class="mx-30 p-2.5">
    
    <div class="flex gap-5 mt-5">

      <NovelCard v-if="currentNovel" :novelinfo="currentNovel" />

    </div>

    <div class="flex mt-5 justify-between">
      
        <NovelSameNovel />
    
      
        <NovelSimilarNovel />
      
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