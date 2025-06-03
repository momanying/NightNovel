<template>
<div class="min-h-screen from-gray-900 to-black">
  <LayoutsHeaderContainer />

  <!-- Novel info section (always visible) -->
  <div class="mx-4 lg:mx-10 xl:mx-40 p-2.5 mt-5">
    <NovelInfomation v-if="currentNovel" :novel="currentNovel" />
  </div>

  <!-- Tab navigation -->
  <NovelTabNavigation 
    :tabs="tabs" 
    :active-tab="activeTab" 
    @change="setActiveTab" 
  />

  <div class="mx-4 lg:mx-10 xl:mx-40 p-2.5">
    
    <transition name="fade" mode="out-in">
      <div :key="activeTab" class="py-4">
        
        <template v-if="activeTab === 'similar'">
          <div id="similar">
            <div class="flex flex-col md:flex-row md:space-x-6 mb-8">
              <div class="w-full md:w-1/2 mb-6 md:mb-0">
                <ClientOnly>
                  <NovelSimilarNovel />
                </ClientOnly>
              </div>

              <div class="w-full md:w-1/2">
                <ClientOnly>
                  <NovelSimilarFinishNovel />
                </ClientOnly>
              </div>
            </div>

            <div class="max-w-[1200px] mx-auto my-8"> <!-- Ensured vertical margin for separator -->
              <div class="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"/>
            </div>

            <div class="mt-8 mb-12">
              <div class="max-w-[1200px] mx-auto">
                <NovelComment />
              </div>
            </div>
          </div>
        </template>

        <div v-else-if="activeTab === 'reviews'" id="reviews" class="max-w-[1200px] mx-auto">
          <NovelPopularComment :novel-id="novelId" />
        </div>
      </div>
    </transition>

  </div>
</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNovelStore } from '~/stores/novel'
import { nextTick } from 'vue'

const route = useRoute()
const novelId = computed(() => route.params.id as string)
const novelStore = useNovelStore()

// 从store中获取响应式状态
const { currentNovel } = storeToRefs(novelStore)

// Tab navigation state
const tabs = [
  { id: 'similar', label: '相关推荐' },
  { id: 'reviews', label: '精华书评' }
] 

const activeTab = ref('similar')

// Set active tab and potentially update URL hash
const setActiveTab = async (tabId: string) => {
  activeTab.value = tabId
  await nextTick()
  window.location.hash = tabId
}

onMounted(async () => {
  const hash = window.location.hash.replace('#', '')
  if (hash && tabs.some(tab => tab.id === hash)) {
    activeTab.value = hash
    await nextTick()
    const element = document.getElementById(hash)
    if (element) element.scrollIntoView()
  }
})

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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>