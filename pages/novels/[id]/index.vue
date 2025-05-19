<template>
<div>
  <LayoutsHeaderContainer />
  <div class="mx-30 p-2.5">
    <div class="flex gap-5 mt-5">
      <NovelCard v-if="currentNovel" :novelinfo="currentNovel" />
      <div v-else-if="loadingNovel" class="w-full text-center py-10">
        <p>正在加载小说信息...</p>
      </div>
      <div v-else-if="novelError" class="w-full text-center py-10">
        <p class="text-red-500">{{ novelError }}</p>
      </div>
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
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'

const route = useRoute()
const novelId = computed(() => route.params.id as string)
const novelStore = useNovelStore()

// 从store中获取响应式状态
const { currentNovel, loadingNovel, novelError } = storeToRefs(novelStore)

// 监听novelId变化，获取小说数据
watch(novelId, async (newId) => {
  if (newId) {
    await novelStore.fetchNovelData(newId)
  }
}, { immediate: true })
</script>