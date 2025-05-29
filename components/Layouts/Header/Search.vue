<template>
    <div ref="searchContainer" class="relative">
        <div class="search" :class="{'open': isOpen}">

            <!-- 搜索按钮  -->
            <button
                class="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-2xl text-center font-black"
                :class="{ 'cursor-default': isOpen }"
                @click="toggleSearch"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </button>

            <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"      
                :placeholder="isOpen ? '搜索...' : ''"
                class="h-10 rounded-lg border-none outline-none transition-all duration-300 ease-in-out focus:outline-none"
                :class="[
                    isOpen
                       ? 'w-96 px-9 text-white bg-gray-800 dark:bg-gray-700 dark:text-gray-200'
                       : 'w-10 text-transparent bg-transparent placeholder-transparent cursor-pointer'
                ]"
                @input="handleInput"
            >

            <!-- 清除按钮   -->
            <button
                v-show="showClear"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                @click="clearSearch"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>

            <!-- 加载指示器 -->
            <div
                v-show="isLoading"
                class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400"
            >
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
            </div>
        </div>

        <!-- 搜索结果下拉框 -->
        <div
            v-if="isOpen && searchResults.length > 0"
            class="absolute right-0 top-11 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 max-h-[80vh] overflow-y-auto"
        >
            <div class="py-2">
                <div
                    v-for="novel in searchResults"
                    :key="novel._id"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    @click="selectResult(novel)"
                >
                    <div class="flex justify-between">
                        <span 
                            class="font-medium text-gray-800 dark:text-gray-200"
                            v-html="highlightTitle(novel.title)"
                        />
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ novel.author }}</span>
                    </div>
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ novel.introduction }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

const isOpen = ref(false);
const searchQuery = ref('');
const searchResults = ref<Novel[]>([]);
const isLoading = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const searchContainer = ref<HTMLDivElement | null>(null);
const showClear = computed(() => searchQuery.value.length > 0);
const hasMoreResults = ref(false);
const totalResults = ref(0);

// 创建防抖函数
const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const toggleSearch = () => {
    if(!isOpen.value) {
        isOpen.value = true;
        nextTick(() => {
            searchInput.value?.focus();
        });
    }
};

const closeSearch = () => {
    isOpen.value = false;
    searchResults.value = [];
}

const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
    searchInput.value?.focus();
}

const handleInput = debounce(() => {
    if(searchQuery.value.length > 0) {
        performSearch();
    } else {
        searchResults.value = [];
    }
}, 300);

const highlightTitle = (title: string) => {
    if (!searchQuery.value) return title;
    
    // Ensure that special characters in searchQuery are escaped for RegExp
    const escapedQuery = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return title.replace(regex, '<strong class="text-primary-600 dark:text-primary-400">$1</strong>');
}

const performSearch = async () => {
    if (!searchQuery.value.trim()) return;
    
    isLoading.value = true;
    
    try {
        // 调用API进行搜索，只显示前5条结果
        const { data } = await useFetch('/api/novels/search', {
          query: { 
            keyword: searchQuery.value,
            limit: 5,
            page: 1
          }
        });
        
        const response = data.value as { 
          code: number; 
          message: string; 
          data?: { 
            novels: Novel[]; 
            pagination: { 
              total: number; 
              page: number; 
              limit: number; 
              totalPages: number;
            } 
          } 
        };
        
        if (response && response.code === 200 && response.data) {
            searchResults.value = response.data.novels;
            totalResults.value = response.data.pagination.total;
            hasMoreResults.value = totalResults.value > 5;
        } else {
            searchResults.value = [];
            hasMoreResults.value = false;
        }
    } catch (error) {
        console.error('搜索出错:', error);
        searchResults.value = [];
    } finally {
        isLoading.value = false;
    }
}

const selectResult = (novel: Novel) => {
    closeSearch();
    navigateTo(`/novels/${novel._id}`);
}

// 当点击Esc键时关闭搜索
onMounted(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen.value &&
            searchContainer.value &&
            !searchContainer.value.contains(event.target as Node)
        ) {
            closeSearch();
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeSearch();
        }
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    
    onUnmounted(() => {
        window.removeEventListener('click', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
    });
});
</script>

<style scoped>
/* 可以添加过渡动画 */
.search-enter-active,
.search-leave-active {
    transition: opacity 0.3s, transform 0.3s;
}

.search-enter-from,
.search-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>