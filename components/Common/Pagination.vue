<template>
  <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2">
    <button
      :disabled="currentPage === 1"
      class="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="goToPage(currentPage - 1)"
    >
      <Icon name="heroicons:chevron-left" class="h-5 w-5" />
      <span class="sr-only">上一页</span>
    </button>

    <template v-for="pageItem in paginatedPages" :key="pageItem.page">
      <button
        v-if="pageItem.type === 'page'"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md',
          currentPage === pageItem.page 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
        ]"
        @click="goToPage(pageItem.page ?? 0)"
      >
        {{ pageItem.page }}
      </button>
      <span
        v-else-if="pageItem.type === 'ellipsis'"
        class="px-3 py-1.5 text-sm font-medium text-gray-400"
      >
        ...
      </span>
    </template>

    <button
      :disabled="currentPage === totalPages"
      class="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      @click="goToPage(currentPage + 1)"
    >
      <Icon name="heroicons:chevron-right" class="h-5 w-5" />
      <span class="sr-only">下一页</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number;
  totalPages: number;
  maxVisibleButtons?: number; // 控制显示多少个页码按钮（不包括省略号和首尾）
}

const props = withDefaults(defineProps<Props>(), {
  maxVisibleButtons: 5,
});

interface Emits {
  (e: 'page-changed', page: number): void;
}
const emit = defineEmits<Emits>();

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-changed', page);
  }
};

interface PageItem {
  type: 'page' | 'ellipsis';
  page?: number;
}

const paginatedPages = computed<PageItem[]>(() => {
  const { currentPage, totalPages, maxVisibleButtons } = props;
  const pagesArray: PageItem[] = [];

  if (totalPages <= maxVisibleButtons + 2) { // 如果总页数不多，直接显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pagesArray.push({ type: 'page', page: i });
    }
    return pagesArray;
  }

  // 添加第一页
  pagesArray.push({ type: 'page', page: 1 });

  const half = Math.floor((maxVisibleButtons - 2) / 2); // -2 是因为已经有了首页和尾页
  let startPage = Math.max(2, currentPage - half);
  let endPage = Math.min(totalPages - 1, currentPage + half);

  if (currentPage - half <= 2) {
    endPage = maxVisibleButtons -1;
  }

  if (currentPage + half >= totalPages - 1) {
    startPage = totalPages - (maxVisibleButtons -2);
  }
  
  // 处理前面的省略号
  if (startPage > 2) {
    pagesArray.push({ type: 'ellipsis' });
  }

  // 添加中间的页码
  for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pagesArray.push({ type: 'page', page: i });
      }
  }
  
  // 处理后面的省略号
  if (endPage < totalPages - 1) {
    pagesArray.push({ type: 'ellipsis' });
  }

  // 添加最后一页
  pagesArray.push({ type: 'page', page: totalPages });
  
  return pagesArray;
});
</script>

<style scoped>
/* 你可以在这里添加一些特定的样式，如果需要的话 */
</style> 