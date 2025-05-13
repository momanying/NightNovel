<template>
    <div>
    <LayoutsTheHeader />
    
    <!-- 筛选框 -->
    <div class="bg-gray-900 px-4 py-4 mx-10">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <!-- 类型筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">类型筛选</label>
            <div class="relative">
              <select v-model="typeFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in typeOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 语言筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">语言筛选</label>
            <div class="relative">
              <select v-model="languageFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in languageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 平台筛选 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">平台筛选</label>
            <div class="relative">
              <select v-model="platformFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in platformOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- 发行年份 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">发售年份</label>
            <div class="relative">
              <select v-model="yearFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in yearOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 发行月份 -->
          <div class="relative">
            <label class="text-gray-500 text-xs mb-1 block">发售月份</label>
            <div class="relative">
              <select v-model="monthFilter" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                <option v-for="option in monthOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- 资源更新时间 -->
          <div class="flex items-end gap-2">
            <div class="relative flex-grow">
              <label class="text-gray-500 text-xs mb-1 block">资源更新时间</label>
              <div class="relative">
                <select v-model="sortOption" class="w-full bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
                  <option v-for="option in sortOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <button class="bg-gray-800 text-white border border-gray-700 rounded py-2 px-3 h-[38px] flex items-center" @click="handleSortOrderToggle">
              <Icon :name="sortDirection === '降序' ? 'heroicons:arrow-down' : 'heroicons:arrow-up'" class="h-4 w-4" />
              <span class="ml-1 text-sm">{{ sortDirection }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
      
      <!-- 主内容区 -->
      <div class="mx-10 py-5">
        <!-- 小说列表 -->
        <div class="space-y-6">
        <div v-if="loading" class="py-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
            <p class="mt-4 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="error" class="py-8 text-center">
            <p class="text-red-500">{{ error }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="()=>fetchNovels">
            重试
            </button>
        </div>

        <template v-else>
            <div class="grid grid-cols-2 gap-2">
                <div v-for="novel in novels" :key="novel.id" class="border rounded-lg overflow-hidden">
                    <div class="flex flex-col h-full">
                        <!-- 小说封面和信息改为上下布局 -->
                        <div class="flex p-4">
                            <!-- 小说封面 -->
                            <div class="flex-shrink-0">
                                <NuxtImg 
                                :src="novel.cover_url" 
                                :alt="novel.title" 
                                class="h-32 object-cover rounded-md shadow-md"
                                width="90"
                                height="120"
                                loading="lazy"
                                />
                            </div>

                            <!-- 小说基本信息 -->
                            <div class="w-3/4 pl-4">
                                <!-- 标题和作者 -->
                                <h2 class="text-base font-semibold text-blue-800 hover:text-blue-600 mb-1">
                                    <NuxtLink :to="`/novels/${novel.id}`">{{ novel.title }}</NuxtLink>
                                </h2>
                                <div class="text-xs text-gray-600">
                                    作者：<NuxtLink :to="`/authors/${novel.author}`" class="hover:text-blue-500">{{ novel.author }}</NuxtLink>
                                </div>
                                <div class="text-xs text-gray-600">
                                    分类：<NuxtLink :to="`/categories/${novel.category}`" class="hover:text-blue-500">{{ novel.category }}</NuxtLink>
                                </div>
                                
                                <!-- 更新信息 -->
                                <div class="text-xs text-gray-600 mt-1">
                                    更新：{{ novel.lastUpdate }}/字数：{{ novel.word_count }}
                                    <div>{{ novel.status }}<span v-if="novel.animation" class="text-red-500 ml-1">/已动画化</span></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="px-4 pb-4">
                            <!-- 标签 -->
                            <div class="mb-2">
                                <template v-if="novel.tags && typeof novel.tags === 'string'">
                                    <NuxtLink 
                                        v-for="(tag, index) in novel.tags.split(',').slice(0, 4)" 
                                        :key="index"
                                        :to="`/tags/${tag}`" 
                                        class="inline-block text-xs bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1 hover:bg-gray-700"
                                    >
                                        {{ tag }}
                                    </NuxtLink>
                                </template>
                                <template v-else-if="novel.tags && Array.isArray(novel.tags)">
                                    <NuxtLink 
                                        v-for="(tag, index) in novel.tags.slice(0, 4)" 
                                        :key="index"
                                        :to="`/tags/${tag}`" 
                                    class="inline-block text-xs bg-gray-800 px-1.5 py-0.5 rounded mr-1 mb-1 hover:bg-gray-700"
                                    >
                                        {{ tag }}
                                    </NuxtLink>
                                </template>
                            </div>

                            <!-- 简介 -->
                            <div class="text-xs text-gray-700 mb-3 line-clamp-2">
                                {{ novel.introduction }}
                            </div>

                            <!-- 操作按钮 -->
                            <div class="flex gap-1 text-xs">
                                <NuxtLink :to="`/novels/${novel.id}/read`" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    阅读
                                </NuxtLink>
                                <button class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" @click="addToBookshelf(novel._id)">
                                    收藏
                                </button>
                                <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="recommendNovel(novel.id)">
                                    推荐
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        </div>

        <!-- 分页 -->
        <div class="mt-8 flex justify-center">
        <div class="flex space-x-2">
            <button
            class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50" 
            :disabled="currentPage <= 1"
            type="button"
            @click="handlePrevPage" 
            >
            上一页
            </button>
            <template v-for="page in totalPages" :key="page">
            <button  
                :class="[
                'px-4 py-2 border rounded',
                currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                ]"
                type="button"
                @click="() => handlePageChange(page)"
            >
                {{ page }}
            </button>
            </template>
            <button 
            class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            type="button"
            @click="handleNextPage" 
            >
            下一页
            </button>
        </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo'

const $api = useNuxtApp().$api
const loading = ref(true)
const error = ref('')
const novels = ref<Novel[]>([])

// 筛选相关状态
const typeFilter = ref('全部类型')
const languageFilter = ref('全部语言')
const platformFilter = ref('全部平台')
const yearFilter = ref('全部年份')
const monthFilter = ref('全部月份')
const sortOption = ref('资源更新时间')
const sortDirection = ref('降序')

// 筛选选项
const typeOptions = ['全部类型', '日本轻小说', '华文轻小说', 'Web轻小说', '轻改漫画', '韩国轻小说']
const languageOptions = ['全部语言']
const platformOptions = ['全部平台', 'GA文库', 'MF文库J', '角川文库', '电击文库', '富士见文库', '小学馆']
const yearOptions = ['全部年份', '2025', '2024', '2023', '2022', '2021']
const monthOptions = ['全部月份', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const sortOptions = ['周点击', '月点击', '周推荐', '月推荐', '周鲜花', '月鲜花', '收藏数', '资源更新时间', '入库时间']

// 分页状态
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(10)
const total = ref(0)

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchNovels()
}

// 处理排序方向变化
const handleSortOrderToggle = () => {
  sortDirection.value = sortDirection.value === '降序' ? '升序' : '降序'
  handleFilterChange()
}

// 构建查询参数
const buildQueryParams = () => {
  const params: {
    page: number
    limit: number
    category?: string
    tag?: string
    keyword?: string
    sort?: string
    order?: string
  } = {
    page: currentPage.value,
    limit: itemsPerPage.value
  }

  // 添加分类筛选
  if (typeFilter.value !== '全部类型') {
    params.category = typeFilter.value
  }

  // 添加排序参数
  if (sortOption.value !== '资源更新时间') {
    params.sort = sortOption.value
  }

  // 添加排序方向
  params.order = sortDirection.value === '降序' ? 'desc' : 'asc'

  return params
}

// 获取小说列表数据
const fetchNovels = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = buildQueryParams()
    const { data: response } = await $api.novel.getList(params)
    
    if (response.value && response.value.code === 200 && response.value.data) {
      novels.value = response.value.data.novels || []
      
      // 更新分页信息
      total.value = response.value.data.pagination.total
      currentPage.value = response.value.data.pagination.page
      itemsPerPage.value = response.value.data.pagination.limit
      totalPages.value = response.value.data.pagination.totalPages
    } else {
      error.value = response.value?.message || '获取小说列表失败'
      novels.value = []
    }
  } catch (err) {
    console.error('获取小说列表失败:', err)
    error.value = '获取小说列表失败，请稍后再试'
    novels.value = []
  } finally {
    loading.value = false
  }
}

// 改变页码
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchNovels()
}

// 分页处理函数
const handlePageChange = (page: number) => {
  changePage(page)
}

const handlePrevPage = () => {
  changePage(currentPage.value - 1)
}

const handleNextPage = () => {
  changePage(currentPage.value + 1)
}

// 添加到书架
const addToBookshelf = (novelId: undefined | string) => {
  // TODO: 实现添加到书架的逻辑
  console.log('添加到书架:', novelId)
  // 如果有认证系统，可能需要检查用户是否已登录
  // 如果没有登录，可能需要重定向到登录页面
}

// 推荐小说
const recommendNovel = (novelId: undefined | string) => {
  // TODO: 实现推荐小说的逻辑
  console.log('推荐小说:', novelId)
}

// 生命周期钩子
onMounted(() => {
  fetchNovels()
})

// 监听路由变化，重新加载数据
watch(() => useRoute().query, () => {
  const page = parseInt(useRoute().query.page as string) || 1
  if (page !== currentPage.value) {
    currentPage.value = page
    fetchNovels()
  }
}, { immediate: true })

// SEO优化
useHead({
  title: '夜幕轻小说全集',
  meta: [
    { name: 'description', content: '最新轻小说全集列表，包含各种分类、标签的轻小说作品。' }
  ]
})
</script>
