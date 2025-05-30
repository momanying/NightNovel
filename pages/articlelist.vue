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
      <div class="mt-8 flex justify-center">
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

// Filter states and options are moved to FilterBar.vue
// handleFilterChange and handleSortOrderToggle are moved to FilterBar.vue

const buildQueryParams = () => {
  const params: Record<string, string | number | boolean> = {
    page: currentPage.value,
    limit: itemsPerPage.value
  };
  // Read filters directly from route.query as FilterBar updates the URL
  if (route.query.category) params.category = route.query.category as string;
  if (route.query.platform) params.platform = route.query.platform as string;
  if (route.query.year) params.year = route.query.year as string;
  if (route.query.month) params.month = route.query.month as string;
  if (route.query.sort) params.sort = route.query.sort as string;
  if (route.query.order) params.order = route.query.order as string;
  if (route.query.animation === 'true') params.animation = true;
  if (route.query.tag) params.tag = route.query.tag as string;
  if (route.query.status) params.status = route.query.status as string;

  return params;
};

const fetchNovels = async () => {
  loading.value = true;
  error.value = '';
  try {
    const params = buildQueryParams();
    const response = await useFetch('/api/novels/list', {
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

// Function to update pagination state from route query.
const updatePaginationFromRoute = () => {
  currentPage.value = parseInt(route.query.page as string) || 1;
};

onMounted(() => {
  updatePaginationFromRoute();
  fetchNovels();
});

// Watch for changes in route.fullPath to refetch novels and update pagination
watch(() => route.fullPath, 
  async (newFullPath, oldFullPath) => {
    if (newFullPath !== oldFullPath) {
        updatePaginationFromRoute();
        await fetchNovels();
    }
  },
  { immediate: true }
);

// SEO optimization
useHead({
  title: '夜幕轻小说全集',
  meta: [
    { name: 'description', content: '最新轻小说全集列表，包含各种分类、标签的轻小说作品。' }
  ]
});
</script>
