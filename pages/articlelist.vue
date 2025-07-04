<template>
  <div>
    <LayoutsHeaderContainer />
    
    <ArticleListFilterBar />
      
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
            <ArticleListNovelCard 
              v-for="novel in novels" 
              :key="novel._id" 
              :novel="novel"
            />
          </div>
          <div v-if="novels.length === 0" class="py-8 text-center text-gray-500">
            暂无符合条件的小说
          </div>
        </template>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 0" class="mt-8 flex justify-center">
        <CommonPageNation 
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-changed="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const loading = ref(true);
const error = ref('');
const novels = ref<Novel[]>([]);
const route = useRoute();
const router = useRouter();

// Pagination states
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(10);
const total = ref(0);

const buildQueryParams = () => {
  const params: Record<string, string | number | boolean> = {
    page: currentPage.value,
    limit: itemsPerPage.value
  };
  
  // 从路由中读取所有筛选参数
  const queryParams = [
    'category', 'tag', 'wordCount', 'updateTime', 'sort', 'order', 
    'animation', 'status', 'keyword'
  ];
  
  queryParams.forEach(param => {
    if (route.query[param]) {
      const value = route.query[param];
      if (typeof value === 'string') {
        params[param] = value;
      }
    }
  });

  return params;
};

const fetchNovels = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params = buildQueryParams();
    const endpoint = route.query.keyword ? '/api/novels/search' : '/api/novels/list';
    const response = await useFetch(endpoint, {
      method: 'GET',
      query: params,
      watch: false
    });
    
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
      novels.value = successfulResponse.data.novels || [];
      const paginationData = successfulResponse.data.pagination;
      total.value = paginationData.total;
      currentPage.value = paginationData.page;
      itemsPerPage.value = paginationData.limit;
      totalPages.value = paginationData.totalPages;
    } else {
      error.value = response.data.value?.message || '获取小说列表失败';
      novels.value = [];
      total.value = 0; currentPage.value = 1; totalPages.value = 0;
    }
  } catch (err) {
    console.error('获取小说列表失败:', err);
    error.value = '获取小说列表失败，请稍后再试';
    novels.value = [];
    total.value = 0; currentPage.value = 1; totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    router.push({ query: { ...route.query, page: String(page) } });
  }
};

// 从路由查询参数更新分页状态
const updatePaginationFromRoute = () => {
  currentPage.value = parseInt(route.query.page as string) || 1;
};

// 监听路由变化以重新获取小说列表和更新分页
watch(() => route.fullPath, 
  async (newFullPath, oldFullPath) => {
    if (newFullPath !== oldFullPath) {
        updatePaginationFromRoute();
        await fetchNovels();
    }
  },
  { immediate: true }
);

// SEO 优化
useHead(() => ({
  title: route.query.keyword
    ? `搜索 "${route.query.keyword as string}" 的结果`
    : '夜幕轻小说全集',
  meta: [
    { name: 'description', content: route.query.keyword ? `关于 "${route.query.keyword as string}" 的搜索结果。` : '最新轻小说全集列表，包含各种分类、标签的轻小说作品。' }
  ]
}));
</script>
