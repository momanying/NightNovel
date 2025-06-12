<template>
  <div class="bg-gray-900 p-4 opacity-90">
    <div class="max-w-7xl mx-auto">
      <div class="grid gap-3">
        <!-- 类型筛选 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block">标签云集</label>
          <div class="relative">
            <div class="w-full text-white rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
              <div v-for="option in typeOptions" :key="option" :value="option" :style="{ display: 'inline-block', marginRight: '10px' }">
                {{ option }}
              </div>
            </div>
          </div>
        </div>

        <!-- 语言筛选 -->
        <div class="flex items-center">
          <label class="text-gray-500 text-sm block">作品字数</label>
          <div class="relative">
            <div class="w-full text-white rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
              <div v-for="option in languageOptions" :key="option" :value="option" :style="{ display: 'inline-block', marginRight: '10px' }">
                {{ option }}
              </div>
            </div>
          </div>
        </div>

      <!-- 发行年份 -->
      <div class="flex items-center">
        <label class="text-gray-500 text-sm block">更新时间</label>
        <div class="relative">
          <div class="w-full text-white rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
            <div v-for="option in yearOptions" :key="option" :value="option" :style="{ display: 'inline-block', marginRight: '10px' }">
              {{ option }}
            </div>
          </div>
        </div>
      </div>

      <!-- 发行月份 -->
      <div class="flex items-center">
        <label class="text-gray-500 text-sm block">排序方式</label>
        <div class="relative">
          <div class="w-full text-white rounded py-2 px-3 appearance-none text-sm" @change="handleFilterChange">
            <div v-for="option in monthOptions" :key="option" :value="option" :style="{ display: 'inline-block', marginRight: '10px' }">
              {{ option }}
            </div>
          </div>
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
const typeFilter = ref('全部类型');
const platformFilter = ref('全部平台');
const yearFilter = ref('全部年份');
const monthFilter = ref('全部月份');
const sortOption = ref('资源更新时间');
const sortDirection = ref('降序');

// Filter options - these could also be props if they need to be dynamic from parent
const typeOptions = ['全部类型', '异世界', '都市', '科幻', '悬疑', '恋爱', '校园', '游戏', '同人', '其他'];
const languageOptions = ['全部字数', '10万字以下', '10-30万字', '30-50万字', '50-100万字', '100万字以上']; // Assuming static for now
const yearOptions = ['不限', '三日内', '七日内', '半月内','一月内'];
const monthOptions = ['不限', '时间正序', '时间倒序'];

const updateFiltersFromRoute = () => {
  const query = route.query;
  typeFilter.value = (query.category as string) || '全部类型';
  platformFilter.value = (query.platform as string) || '全部平台';
  yearFilter.value = (query.year as string) || '全部年份';
  monthFilter.value = (query.month as string) || '全部月份';
  sortOption.value = (query.sort as string) || '资源更新时间';
  sortDirection.value = query.order === 'asc' ? '升序' : '降序';
  // languageFilter might need similar logic if it becomes dynamic
};

const handleFilterChange = () => {
  const newQuery: Record<string, string | undefined> = {};

  // Preserve non-filter related query params first
  for (const key in route.query) {
    if (!['category', 'platform', 'year', 'month', 'sort', 'order', 'page'].includes(key)) {
      const value = route.query[key];
      if (typeof value === 'string') {
        newQuery[key] = value;
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        newQuery[key] = value[0];
      }
    }
  }
  
  // Add current filter values
  if (typeFilter.value !== '全部类型') newQuery.category = typeFilter.value;
  if (platformFilter.value !== '全部平台') newQuery.platform = platformFilter.value;
  if (yearFilter.value !== '全部年份') newQuery.year = yearFilter.value;
  if (monthFilter.value !== '全部月份') newQuery.month = monthFilter.value;
  if (sortOption.value !== '资源更新时间') newQuery.sort = sortOption.value;
  newQuery.order = sortDirection.value === '降序' ? 'desc' : 'asc';
  
  // Page should be reset to 1 on filter change
  // newQuery.page = '1'; // The main page watcher will handle page if it's removed

  // Create a copy of current query, remove page, then apply new filters
  const currentQuery = { ...route.query };
  delete currentQuery.page; // Reset page to 1

  router.push({ query: { ...currentQuery, ...newQuery } as Record<string, string> });
};

onMounted(() => {
  updateFiltersFromRoute();
});

// Watch for external route changes to update local filter refs
watch(() => route.fullPath, (newPath, oldPath) => {
    if (newPath !== oldPath) { // Ensure it actually changed to avoid loops if possible
        updateFiltersFromRoute();
    }
}, { deep: true }); // deep might be overkill, fullPath should be enough

</script> 