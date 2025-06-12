<template>
  <div class="bg-gray-900 p-4 opacity-90">
    <div class="max-w-7xl mx-auto">
      <div class="grid gap-3">
        <!-- 类型筛选 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block w-[140px]">标签云集</label>
          <div class="relative flex flex-wrap ml-2">
            <button
              v-for="option in tagsOptions" 
              :key="option" 
              class="text-sm px-3 py-1 mb-2 rounded-full transition-colors"
              :class="tagFilter === option ? 'bg-sky-500 text-white' : 'text-white hover:bg-gray-700'"
              @click="tagFilter = option; handleFilterChange()"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- 字数筛选 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block w-20">作品字数</label>
          <div class="relative flex flex-wrap">
            <button
              v-for="option in wordCountOptions" 
              :key="option" 
              class="text-sm px-3 py-1 mr-2 mb-2 rounded-full transition-colors"
              :class="wordCountFilter === option ? 'bg-sky-500 text-white' : 'text-white hover:bg-gray-700'"
              @click="wordCountFilter = option; handleFilterChange()"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- 更新时间 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block w-20">更新时间</label>
          <div class="relative flex flex-wrap">
            <button
              v-for="option in updateTimeOptions" 
              :key="option" 
              class="text-sm px-3 py-1 mr-2 mb-2 rounded-full transition-colors"
              :class="updateTimeFilter === option ? 'bg-sky-500 text-white' : 'text-white hover:bg-gray-700'"
              @click="updateTimeFilter = option; handleFilterChange()"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- 排序方式 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block w-20">排序方式</label>
          <div class="relative flex flex-wrap">
            <button
              v-for="option in sortOptions" 
              :key="option" 
              class="text-sm px-3 py-1 mr-2 mb-2 rounded-full transition-colors"
              :class="sortOption === option ? 'bg-sky-500 text-white' : 'text-white hover:bg-gray-700'"
              @click="sortOption = option; handleFilterChange()"
            >
              {{ option }}
            </button>
            
            <!-- 排序方向 -->
            <button 
              class="text-sm px-3 py-1 mr-2 mb-2 rounded-full text-white hover:bg-gray-700 flex items-center"
              @click="toggleSortDirection"
            >
              {{ sortDirection === 'desc' ? '降序' : '升序' }}
              <span class="ml-1">
                <Icon :name="sortDirection === 'desc' ? 'heroicons:arrow-down' : 'heroicons:arrow-up'" class="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Filter states
const tagFilter = ref('全部类型');
const wordCountFilter = ref('全部字数');
const updateTimeFilter = ref('不限');
const sortOption = ref('不限');
const sortDirection = ref('desc');

// Filter options
const tagsOptions = ref(['全部类型']);
const wordCountOptions = ['全部字数', '10万字以下', '10-30万字', '30-50万字', '50-100万字', '100万字以上'];
const updateTimeOptions = ['不限', '三日内', '七日内', '半月内', '一月内'];
const sortOptions = ['不限', '更新时间', '点击量', '收藏量', '推荐量', '评论量'];

// Fetch tags from API
const fetchTags = async () => {
  try {
    const response = await $fetch<{ data: string[] }>('/api/tags/cloud');
    if (response.data) {
      tagsOptions.value = ['全部类型', ...response.data];
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error);
  }
};

// 从路由参数更新筛选状态
const updateFiltersFromRoute = () => {
  const query = route.query;
  tagFilter.value = (query.tag as string) || '全部类型';
  wordCountFilter.value = (query.wordCount as string) || '全部字数';
  updateTimeFilter.value = (query.updateTime as string) || '不限';
  sortOption.value = (query.sort as string) || '不限';
  sortDirection.value = (query.order as string) || 'desc';
};

// 切换排序方向
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
  handleFilterChange();
};

// 处理筛选变化
const handleFilterChange = () => {
  const newQuery: Record<string, string | undefined> = {};

  for (const key in route.query) {
    if (!['tag', 'wordCount', 'updateTime', 'sort', 'order', 'page'].includes(key)) {
      const value = route.query[key];
      if (typeof value === 'string') {
        newQuery[key] = value;
      }
    }
  }
  
  if (tagFilter.value !== '全部类型') newQuery.tag = tagFilter.value;
  if (wordCountFilter.value !== '全部字数') newQuery.wordCount = wordCountFilter.value;
  if (updateTimeFilter.value !== '不限') newQuery.updateTime = updateTimeFilter.value;
  if (sortOption.value !== '不限') newQuery.sort = sortOption.value;
  
  newQuery.order = sortDirection.value;
  newQuery.page = '1';

  router.push({ query: newQuery });
};

onMounted(() => {
  fetchTags();
  updateFiltersFromRoute();
});

// 监听路由变化以更新本地筛选状态
watch(() => route.fullPath, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    updateFiltersFromRoute();
  }
}, { deep: true });
</script> 