<template>
  <div class="flex flex-col space-y-7 rounded-r-lg shadow-lg relative h-full">

    <SideBarRecommendedBook
      class="w-full"
    />

    <SideBarRank :novels="props.topNovels" />

    <SideBarPersonList
      class="w-full"
    />

    <SideBarNewNovel class="w-full absolute bottom-0" />
  </div>
</template>

  
<script setup lang="ts">
// 导入Tag接口，替换本地定义的Tag接口
import type { Novel } from '~/types/novel/novelinfo';

const props = defineProps({
  topNovels:{
    type: Array as () => Novel[],
    required: true
  }
})

interface Category {
  id: number | string
  name: string
  count: number
}

interface Status {
  id: number | string
  name: string
  type: string
  count: number
}

// 响应式状态
const categories = ref<Category[]>([])
const statuses = ref<Status[]>([])

// 加载状态
const loading = ref({
  recommend: true,
  categories: true,
  statuses: true,
  tags: true
})

// 错误状态
const error = ref({
  recommend: '',
  categories: '',
  statuses: '',
  tags: ''
})

// 获取分类列表
const getCategories = async () => {
  loading.value.categories = true
  error.value.categories = ''
  
  try {
    // 实际项目中应该使用API获取分类列表
    // const response = await $api.novel.getCategories()
    // if (response.code === 200) {
    //   categories.value = response.data
    // }
    
    // 模拟数据
    setTimeout(() => {
      categories.value = [
        { id: 1, name: "奇幻冒险", count: 1256 },
        { id: 2, name: "校园爱情", count: 864 },
        { id: 3, name: "科幻未来", count: 753 },
        { id: 4, name: "悬疑推理", count: 421 },
        { id: 5, name: "异世界", count: 1892 },
        { id: 6, name: "后宫", count: 367 },
        { id: 7, name: "搞笑", count: 512 },
        { id: 8, name: "轻百合", count: 284 },
        { id: 9, name: "竞技", count: 198 },
      ]
      loading.value.categories = false
    }, 300)
  } catch (err) {
    console.error('获取分类列表失败:', err)
    error.value.categories = '获取分类列表失败'
    loading.value.categories = false
  }
}

// 获取状态列表
const getStatuses = async () => {
  loading.value.statuses = true
  error.value.statuses = ''
  
  try {
    // 模拟数据
    setTimeout(() => {
      statuses.value = [
        { id: 1, name: "连载中", type: "ongoing", count: 1024 },
        { id: 2, name: "已完结", type: "completed", count: 2048 },
        { id: 3, name: "最近更新", type: "recent", count: 512 }
      ]
      loading.value.statuses = false
    }, 200)
  } catch (err) {
    console.error('获取状态列表失败:', err)
    error.value.statuses = '获取状态列表失败'
    loading.value.statuses = false
  }
}

// 获取标签列表
const getTags = async () => {
  loading.value.tags = true
  error.value.tags = ''
  
  try {
    // 实际项目中应该使用API获取标签列表
    // const response = await $api.novel.getTags()
    // if (response.code === 200) {
    //   tags.value = response.data
    // }
    
    // 模拟数据
    setTimeout(() => {
      loading.value.tags = false
    }, 250)
  } catch (err) {
    console.error('获取标签列表失败:', err)
    error.value.tags = '获取标签列表失败'
    loading.value.tags = false
  }
}

// 生命周期钩子
onMounted(() => {
  getCategories()
  getStatuses()
  getTags()
})
</script>