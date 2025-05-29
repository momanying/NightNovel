<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Filter states
const typeFilter = ref('全部类型');
const languageFilter = ref('全部语言');
const platformFilter = ref('全部平台');
const yearFilter = ref('全部年份');
const monthFilter = ref('全部月份');
const sortOption = ref('资源更新时间');
const sortDirection = ref('降序');

// Filter options - these could also be props if they need to be dynamic from parent
const typeOptions = ['全部类型', '日本轻小说', '华文轻小说', 'Web轻小说', '轻改漫画', '韩国轻小说'];
const languageOptions = ['全部语言']; // Assuming static for now
const platformOptions = ['全部平台', 'GA文库', 'MF文库J', '角川文库', '电击文库', '富士见文库', '小学馆'];
const yearOptions = ['全部年份', '2025', '2024', '2023', '2022', '2021'];
const monthOptions = ['全部月份', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const sortOptions = ['周点击', '月点击', '周推荐', '月推荐', '周鲜花', '月鲜花', '收藏数', '资源更新时间', '入库时间'];

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

const handleSortOrderToggle = () => {
  sortDirection.value = sortDirection.value === '降序' ? '升序' : '降序';
  handleFilterChange(); // This will update the route
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