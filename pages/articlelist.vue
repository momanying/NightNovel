<template>
  <div>
    <LayoutsHeaderContainer />
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
      <div class="mx-20 py-5">
        <!-- 小说列表 -->
        <div class="space-y-6">
        <div v-if="loading" class="py-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
            <p class="mt-4 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="error" class="py-8 text-center">
            <p class="text-red-500">{{ error }}</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" @click="fetchNovels">
            重试
            </button>
        </div>

        <template v-else>
            <div class="grid grid-cols-2 gap-2">
                <div v-for="novel in novels" :key="novel._id" class="border rounded-lg overflow-hidden">
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
                                    <NuxtLink :to="`/novels/${novel._id}`">{{ novel.title }}</NuxtLink>
                                </h2>
                                <div class="text-xs text-white">
                                    作者：<span>{{ novel.author }}</span>
                                </div>
                                <div class="text-xs text-white">
                                    分类：<NuxtLink :to="`/articlelist?category=${novel.category}`" class="hover:text-blue-500">{{ novel.category }}</NuxtLink>
                                </div>
                                
                                <!-- 更新信息 -->
                                <div class="text-xs text-gray-600 mt-1">
                                    更新：{{ novel.lastUpdate || '暂无更新' }}/字数：{{ novel.word_count || 0 }}
                                    <div>{{ novel.status || '连载中' }}<span v-if="novel.animation" class="text-red-500 ml-1">/已动画化</span></div>
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
                                {{ novel.introduction || '暂无简介' }}
                            </div>

                            <!-- 操作按钮 -->
                            <div class="flex gap-1 text-xs">
                                <NuxtLink :to="`/novels/${novel._id}`" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    阅读
                                </NuxtLink>
                                <button class="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600" @click="addToBookshelf(novel._id)">
                                    收藏
                                </button>
                                <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="recommendNovel(novel._id)">
                                    推荐
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="novels.length === 0" class="py-8 text-center text-gray-500">
                暂无符合条件的小说
            </div>
        </template>
        </div>

        <!-- 分页 -->
        <div class="mt-8 flex justify-center">
          <PageNation 
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-changed="handlePageChange"
          />
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo'
import { useRoute, useRouter } from 'vue-router'

const loading = ref(true)
const error = ref('')
const novels = ref<Novel[]>([])
const route = useRoute()
const router = useRouter()

// Filter states
const typeFilter = ref('全部类型')
const languageFilter = ref('全部语言')
const platformFilter = ref('全部平台')
const yearFilter = ref('全部年份')
const monthFilter = ref('全部月份')
const sortOption = ref('资源更新时间')
const sortDirection = ref('降序')

// Filter options
const typeOptions = ['全部类型', '日本轻小说', '华文轻小说', 'Web轻小说', '轻改漫画', '韩国轻小说']
const languageOptions = ['全部语言']
const platformOptions = ['全部平台', 'GA文库', 'MF文库J', '角川文库', '电击文库', '富士见文库', '小学馆']
const yearOptions = ['全部年份', '2025', '2024', '2023', '2022', '2021']
const monthOptions = ['全部月份', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const sortOptions = ['周点击', '月点击', '周推荐', '月推荐', '周鲜花', '月鲜花', '收藏数', '资源更新时间', '入库时间']

// Pagination states
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(10)
const total = ref(0)

const handleFilterChange = () => {
  currentPage.value = 1;

  // Build newQuery from scratch based on filter refs
  const newQuery: Record<string, string | undefined> = {};

  if (typeFilter.value !== '全部类型') newQuery.category = typeFilter.value;
  if (platformFilter.value !== '全部平台') newQuery.platform = platformFilter.value;
  if (yearFilter.value !== '全部年份') newQuery.year = yearFilter.value;
  if (monthFilter.value !== '全部月份') newQuery.month = monthFilter.value;
  if (sortOption.value !== '资源更新时间') newQuery.sort = sortOption.value;
  newQuery.order = sortDirection.value === '降序' ? 'desc' : 'asc';
  
  // Preserve any other existing query parameters that are not part of these filters
  // and ensure they are strings or undefined.
  for (const key in route.query) {
    if (!['category', 'platform', 'year', 'month', 'sort', 'order', 'page'].includes(key)) {
      const value = route.query[key];
      if (typeof value === 'string') {
        newQuery[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        newQuery[key] = value[0]; // Take the first value if it's an array of strings
      }
      // null or other types will be omitted, effectively deleting them or use newQuery[key] = undefined;
    }
  }

  router.push({ query: newQuery as Record<string, string> }); // Nuxt router query often expects Record<string, string>
  // fetchNovels() will be called by the watcher on route.query
};

// 处理排序方向变化
const handleSortOrderToggle = () => {
  sortDirection.value = sortDirection.value === '降序' ? '升序' : '降序'
  handleFilterChange()
}

const buildQueryParams = () => {
  const params: Record<string, string | number | boolean> = {
    page: currentPage.value,
    limit: itemsPerPage.value
  }
  // Use route.query to build params, ensuring filters are driven by URL
  if (route.query.category) params.category = route.query.category as string;
  if (route.query.platform) params.platform = route.query.platform as string;
  if (route.query.year) params.year = route.query.year as string;
  if (route.query.month) params.month = route.query.month as string;
  if (route.query.sort) params.sort = route.query.sort as string;
  if (route.query.order) params.order = route.query.order as string;
  if (route.query.animation === 'true') params.animation = true;
  if (route.query.tag) params.tag = route.query.tag as string;
  if (route.query.status) params.status = route.query.status as string;

  return params
}

const fetchNovels = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = buildQueryParams() // buildQueryParams now reads from route.query
    const response = await useFetch('/api/novels/list', {
      method: 'GET',
      query: params
    })
    
    if (response.data.value && response.data.value.code === 200) {
      const successfulResponse = response.data.value as {
        code: 200;
        message: string;
        data: {
          novels: Novel[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      };
      novels.value = successfulResponse.data.novels || []
      const paginationData = successfulResponse.data.pagination;
      total.value = paginationData.total;
      currentPage.value = paginationData.page;
      itemsPerPage.value = paginationData.limit;
      totalPages.value = paginationData.totalPages;
    } else {
      error.value = response.data.value?.message || '获取小说列表失败'
      novels.value = []
      total.value = 0; currentPage.value = 1; totalPages.value = 0;
    }
  } catch (err) {
    console.error('获取小说列表失败:', err)
    error.value = '获取小说列表失败，请稍后再试'
    novels.value = []
    total.value = 0; currentPage.value = 1; totalPages.value = 0;
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    // currentPage.value = page; // currentPage will be updated by watcher reacting to route change
    router.push({ query: { ...route.query, page: String(page) } });
    // fetchNovels() will be called by watcher
  }
};

// Function to update filter refs based on route query. To be called on mount and route change.
const updateFiltersFromRoute = () => {
  const query = route.query;
  typeFilter.value = (query.category as string) || '全部类型';
  platformFilter.value = (query.platform as string) || '全部平台';
  yearFilter.value = (query.year as string) || '全部年份';
  monthFilter.value = (query.month as string) || '全部月份';
  sortOption.value = (query.sort as string) || '资源更新时间';
  sortDirection.value = query.order === 'asc' ? '升序' : '降序';
  currentPage.value = parseInt(query.page as string) || 1;
  // Note: We don't have specific filter refs for 'animation', 'tag', or 'status' 
  // in the UI apart from the menu links. If these were to be displayed/changeable 
  // in the filter UI, you'd add refs for them here and update them.
};

onMounted(() => {
  updateFiltersFromRoute(); // Initialize filters from URL query first
  // fetchNovels(); // fetchNovels will be called by the watcher if query changes significantly enough or initially
});

// Watch for changes in route.query to refetch novels and update filters
watch(() => route.fullPath, // Watch fullPath to react to any query change
  async (newFullPath, oldFullPath) => {
    if (newFullPath !== oldFullPath) { // Ensure it actually changed
        updateFiltersFromRoute();
        await fetchNovels();
    }
  },
  { immediate: true } // immediate: true will call fetchNovels on component mount
);

// 添加到书架
const addToBookshelf = (novelId: string | undefined) => {
  if (!novelId) return
  // TODO: 实现添加到书架的逻辑
  console.log('添加到书架:', novelId)
  // 如果有认证系统，可能需要检查用户是否已登录
  // 如果没有登录，可能需要重定向到登录页面
}

// 推荐小说
const recommendNovel = (novelId: string | undefined) => {
  if (!novelId) return
  // TODO: 实现推荐小说的逻辑
  console.log('推荐小说:', novelId)
}

// SEO优化
useHead({
  title: '夜幕轻小说全集',
  meta: [
    { name: 'description', content: '最新轻小说全集列表，包含各种分类、标签的轻小说作品。' }
  ]
})
</script>
