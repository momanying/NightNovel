<template>
  <div class="container mx-auto px-4 py-8">
    <LayoutsTheHeader />
    
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">标签：{{ decodeTag }}</h1>
      <p class="text-gray-400">包含"{{ decodeTag }}"标签的小说列表</p>
    </div>
    
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="novels.length === 0" class="text-center py-12">
      <p class="text-gray-500">没有找到含有"{{ decodeTag }}"标签的小说</p>
      <NuxtLink to="/" class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        回到首页
      </NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NovelCard 
        v-for="novel in novels" 
        :key="novel._id" 
        :novelinfo="novel" 
        class="h-full"
      />
    </div>
    
    <!-- 分页 -->
    <div v-if="novels.length > 0 && pagination" class="mt-8 flex justify-center">
      <div class="flex space-x-2">
        <button 
          v-for="page in paginationArray" 
          :key="page"
          :class="[
            'px-3 py-1 rounded', 
            currentPage === page 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import type { ApiResponse } from '~/types/apiresponse';

const route = useRoute();
const router = useRouter();

// 获取并解码标签名
const tagParam = computed(() => route.params.tag as string);
const decodeTag = computed(() => decodeURIComponent(tagParam.value));

// 分页
const currentPage = ref(1);
const pageSize = 12;
const pagination = ref<{ total: number; totalPages: number } | null>(null);

// 状态
const novels = ref<Novel[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// 计算分页数组
const paginationArray = computed(() => {
  if (!pagination.value) return [];
  
  const totalPages = pagination.value.totalPages;
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // 复杂分页逻辑，显示当前页附近的页码和首尾页
  const pages = [];
  if (currentPage.value <= 4) {
    // 当前页靠近开始
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages);
  } else if (currentPage.value >= totalPages - 3) {
    // 当前页靠近结束
    pages.push(1);
    pages.push('...');
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    // 当前页在中间
    pages.push(1);
    pages.push('...');
    for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages);
  }
  
  return pages;
});

// 获取特定标签的小说
const fetchNovels = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data } = await useFetch<ApiResponse<{
      novels: Novel[];
      pagination: { total: number; totalPages: number };
    }>>('/api/novels/search', {
      method: 'GET',
      query: {
        tag: decodeTag.value,
        page: currentPage.value,
        limit: pageSize
      }
    });
    
    if (data.value?.code === 200 && data.value.data) {
      novels.value = data.value.data.novels;
      pagination.value = data.value.data.pagination;
    } else {
      error.value = data.value?.message || '获取小说数据失败';
    }
  } catch (err) {
    console.error('获取标签小说失败:', err);
    error.value = '获取小说数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 监听标签变化
watch(tagParam, () => {
  currentPage.value = 1;
  fetchNovels();
}, { immediate: true });

// 切换页码
const changePage = (page: number | string) => {
  if (typeof page === 'number' && page !== currentPage.value) {
    currentPage.value = page;
    fetchNovels();
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// SEO 优化
useHead({
  title: `标签：${decodeTag.value} - 小说列表`,
  meta: [
    { name: 'description', content: `浏览含有"${decodeTag.value}"标签的小说列表` }
  ]
});
</script> 