<template>
  <div class="flex flex-col space-y-6 py-6 px-4 rounded-r-lg shadow-lg">
    <SideBarRecommendedBook
      class="w-full"
      :novel="recommendedNovel"
      :loading="loading.recommend"
      @navigate="navigateToNovel"
    />

    <SideBarCategoryList
      class="w-full"
      :categories="categories"
      :loading="loading.categories"
      :error="error.categories"
      @navigate="navigateToCategory"
    />

    <SideBarStatusList
      class="w-full"
      :statuses="statuses"
      :loading="loading.statuses"
      :error="error.statuses"
      @navigate="navigateToStatus"
    />

    <SideBarTagCloud
      class="w-full"
      :tags="tags"
      :loading="loading.tags"
      :error="error.tags"
      @navigate="navigateToTag"
    />
  </div>
</template>

  
<script setup lang="ts">

  // 类型定义
  interface RecommendedNovel {
    id: number | string
    title: string
    author: string
    cover: string
  }
  
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
  
  interface Tag {
    id: number | string
    name: string
    count: number
  }
  
  // 响应式状态
  const recommendedNovel = ref<RecommendedNovel>({
    id: 1,
    title: "潜行吧，奈亚子！",
    author: "逢空万太",
    cover: "http://54.255.84.100/i/2025/03/27/67e56ac2ad562.jpg"
  })
  const categories = ref<Category[]>([])
  const statuses = ref<Status[]>([])
  const tags = ref<Tag[]>([])
  
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
      // 实际项目中应该使用API获取状态列表
      // const response = await $api.novel.getStatuses()
      // if (response.code === 200) {
      //   statuses.value = response.data
      // }
      
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
        tags.value = [
          { id: 1, name: "异世界转生", count: 562 },
          { id: 2, name: "魔法", count: 428 },
          { id: 3, name: "校园", count: 765 },
          { id: 4, name: "冒险", count: 512 },
          { id: 5, name: "后宫", count: 324 },
          { id: 6, name: "恋爱", count: 687 },
          { id: 7, name: "战斗", count: 539 },
          { id: 8, name: "游戏", count: 412 },
          { id: 9, name: "轻松", count: 298 },
          { id: 10, name: "搞笑", count: 472 },
          { id: 11, name: "治愈", count: 247 },
          { id: 12, name: "日常", count: 385 },
        ]
        loading.value.tags = false
      }, 250)
    } catch (err) {
      console.error('获取标签列表失败:', err)
      error.value.tags = '获取标签列表失败'
      loading.value.tags = false
    }
  }
  
  // 导航到小说详情页
  const navigateToNovel = (id: number | string) => {
    const path = `/novels/${id}`
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.location.href = path
    }
  }
  
  // 导航到分类页面
  const navigateToCategory = (categoryId: number | string) => {
    navigateTo(`/categories/${categoryId}`)
  }
  
  // 导航到状态页面
  const navigateToStatus = (statusType: string) => {
    navigateTo(`/novels/status/${statusType}`)
  }
  
  // 导航到标签页面
  const navigateToTag = (tagId: number | string) => {
    navigateTo(`/tags/${tagId}`)
  }
  
  // 生命周期钩子
  onMounted(() => {
    getCategories()
    getStatuses()
    getTags()
  })
</script>