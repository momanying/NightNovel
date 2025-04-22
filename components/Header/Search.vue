<template>
    <div class="position-relative">
        <div class="search" :class="{'open': isOpen}">

            <!-- 搜索按钮  -->
            <button
                class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl text-center font-black"
                :class="{ 'cursor-default': isOpen }"
                @click="toggleSearch"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
                       ? 'w-96 px-8 text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
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
                    v-for="(result, index) in searchResults"
                    :key="index"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    @click="selectResult(result)"
                >
                    <div class="flex justify-between">
                        <span class="font-medium text-gray-800 dark:text-gray-200">
                            {{ result.titlePrefix }}
                            <span class="font-bold">{{ result.queryText }}</span>
                            {{ result.titleSuffix }}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ result.data }}</span>
                    </div>
                    <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ result.content }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface SearchResult {
  titlePrefix: string;
  queryText: string;
  titleSuffix: string;
  data: string;
  content: string;
  uri: string;
}

const isOpen = ref(false);
const searchQuery = ref('');
const searchResults = ref<SearchResult[]>([]);
const isLoading = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const showClear = computed(() => searchQuery.value.length > 0);

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

const performSearch = async () => {
    if (!searchQuery.value.trim()) return;
    
    isLoading.value = true;
    
    try {
        // 这里可以替换为实际的API调用
        // const { data } = await useFetch('/api/search', {
        //   query: { q: searchQuery.value }
        // });
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300));
        
        searchResults.value = [
            {
                titlePrefix: '包含 ',
                queryText: searchQuery.value,
                titleSuffix: ' 的搜索结果',
                data: new Date().toISOString().split('T')[0],
                content: `这是包含 ${searchQuery.value} 的搜索结果内容。`,
                uri: '/example'
            },
            {
                titlePrefix: '',
                queryText: searchQuery.value,
                titleSuffix: ' 相关文章',
                data: new Date().toISOString().split('T')[0],
                content: `这是另一个与 ${searchQuery.value} 相关的搜索结果。`,
                uri: '/example/article'
            }
        ];
    } catch (error) {
        console.error('搜索出错:', error);
    } finally {
        isLoading.value = false;
    }
}

const selectResult = (result: SearchResult) => {
    closeSearch();
    navigateTo(result.uri);
}

// 当点击Esc键时关闭搜索
onMounted(() => {
    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) {
            closeSearch();
        }
    };

    window.addEventListener('keydown', handleEsc);

    onUnmounted(() => {
        window.removeEventListener('keydown', handleEsc);
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