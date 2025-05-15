<template>
  <div class="flex w-full h-[400px] bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
    <!-- 左侧：轮播区域 -->
    <div class="w-2/5 h-full p-4">
      <ul class="relative w-full h-full">
        <li 
          v-for="(novel, index) in items" 
          :key="novel._id"
          class="cursor-pointer absolute transition-all duration-500 ease-out shadow-md hover:shadow-xl rounded-lg transform origin-bottom overflow-hidden"
          :style="getStyle(index)"
          @click="onClick(novel._id, index)"
        >
            <img 
              :src="novel.cover_url" 
              :alt="novel.title" 
              class="w-full h-full object-cover rounded-lg"
              @error="handleImageError"
            >
        </li>
      </ul>
    </div>

    <!-- 右侧：小说详情区域 -->
    <div class="w-3/5 h-full flex flex-col justify-center bg-gray-800/50 p-6">
      <div v-if="novelStore.loadingNovel" class="text-center text-gray-400">
        <p>详细信息加载中...</p>
      </div>
      <div v-else-if="novelStore.novelError" class="text-center text-red-400">
        <p>加载详情失败: {{ novelStore.novelError }}</p>
      </div>
      <div v-else-if="displayedNovelDetails">
        <h2 class="text-2xl font-semibold mb-3 text-purple-400 truncate w-full break-words">{{ displayedNovelDetails.title }}</h2>
        <p class="text-sm text-gray-300 mb-1">作者: {{ displayedNovelDetails.author }}</p>
        <p class="text-gray-400 text-xs mt-1 mb-4">更新于: {{ displayedNovelDetails.lastUpdate || '未知' }}</p>
        <p class="text-gray-300 text-sm mt-4 max-h-32 overflow-y-auto pr-2 text-justify leading-relaxed novel-introduction-scrollbar">
          {{ displayedNovelDetails.introduction || '暂无简介' }}
        </p>
        <button 
          v-if="displayedNovelDetails._id && !displayedNovelDetails._id.startsWith('placeholder-')"
          class="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          @click="navigateToNovelPage(displayedNovelDetails._id)"
         >
          阅读详情
        </button>
      </div>
      <div v-else class="text-center text-gray-500">
        <p>请选择一本小说</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';
import { useNovelStore } from '~/stores/novel';

const novelStore = useNovelStore();

const props = defineProps({
  novels: {
    type: Array as () => Novel[],
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 3000
  }
});

// 主图在顶部，下方是4张紧密排列的缩略图
// 索引0: 主图
// 索引1-4: 缩略图
const animations = [
  { left: '55px', top: '10%', opacity: 1, zIndex: 1, width: '180px', height: '230px' }, // 主图，宽度调整为100%相对于其容器（左侧区域的li）
  { left: '50px', top: '80%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },   // 缩略图1
  { left: '100px', top: '80%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图2
  { left: '150px', top: '80%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图3
  { left: '200px', top: '80%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图4
];

const current = ref(0); // 追踪 items.value 中作为主图的索引
let timer: NodeJS.Timeout | null = null;
const items = computed<Novel[]>(() => {
  const novelItems = props.novels || [];
  const result = [...novelItems].slice(0, 5); // Ensure we don't take more than 5 initially
  
  // 如果不足5个，使用占位符填充
  while (result.length < 5) {
    result.push({
      _id: `placeholder-${result.length}`,
      title: '暂无作品',
      cover_url: '/images/default-cover.jpg',
      author: 'N/A',
      introduction: '敬请期待更多精彩内容。',
      category: '',
      status: '连载中',
      lastUpdate: '',
      tags: '',
      volumes: [],
      views: 0,
      rating: 0,
      ratingCount: 0,
      // animation 和 source_site, crawl_time 如果Novel类型需要，也应提供默认值
    } as Novel); // 类型断言，确保符合Novel接口
  }
  return result.slice(0, 5); // 确保最终返回不超过5个元素
});

const getStyle = (itemIndex: number) => {
  // 计算 itemIndex 相对于 current (主图索引) 的位置
  const relativePosition = (itemIndex - current.value + items.value.length) % items.value.length;
  return animations[relativePosition] || {}; // Fallback to empty object
};

// const isMainImage = (itemIndex: number) => {
//   const relativePosition = (itemIndex - current.value + items.value.length) % items.value.length;
//   return relativePosition === 0;
// }

const currentNovelFromItems = computed(() => {
  if (items.value.length > 0 && items.value[current.value]) {
    return items.value[current.value];
  }
  return null;
});

watch(currentNovelFromItems, async (activeNovel) => {
  if (activeNovel && activeNovel._id && !activeNovel._id.startsWith('placeholder-')) {
    // Fetch full details if not already fetched for this ID or if cache is invalid
    // The store's fetchNovelData itself handles caching logic.
    await novelStore.fetchNovelData(activeNovel._id);
  }
}, { immediate: true });

const displayedNovelDetails = computed(() => {
  const activeNovelInCarousel = currentNovelFromItems.value;
  if (!activeNovelInCarousel) return null;

  // If store has the current novel and its ID matches the active one in carousel, prefer store's version
  if (novelStore.currentNovel && novelStore.currentNovel._id === activeNovelInCarousel._id) {
    return novelStore.currentNovel;
  }
  // Otherwise, fallback to the novel data from props (items)
  return activeNovelInCarousel;
});

const next = () => {
  if (items.value.length > 0) {
    current.value = (current.value + 1) % items.value.length;
  }
};

const start = () => {
  stop();
  if (props.autoplay && items.value.length > 1) {
    timer = setInterval(next, props.interval);
  }
};

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = '/images/default-cover.jpg'; 
  }
};

const onClick = (id: string | undefined, itemOriginalIndex: number) => {
  if (!id || id.startsWith('placeholder-')) return;

  const relativePosition = (itemOriginalIndex - current.value + items.value.length) % items.value.length;

  if (relativePosition === 0) { // 点击的是主图
    navigateToNovelPage(id);
  } else { // 点击的是缩略图
    stop();
    current.value = itemOriginalIndex; // 将点击的缩略图设为新的主图
    start();
  }
};

const navigateToNovelPage = (id?: string) => {
  if (!id || id.startsWith('placeholder-')) return;
  localStorage.setItem('novelId', String(id));
  const path = `/novels/${id}`;
  // 在新标签页打开
  const newWindow = window.open(path, '_blank');
  if (newWindow) {
    newWindow.focus();
  }
};

onMounted(() => {
  start();
});

onBeforeUnmount(() => {
  stop();
});

</script>

<style scoped>
li {
  /* transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1); */ /* Can be re-enabled if needed */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

li:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  /* z-index is managed by animation style now if needed, but hover can still have higher z-index */
  /* z-index: 10 !important; */ 
}

.novel-introduction-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.novel-introduction-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.novel-introduction-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(192, 132, 252, 0.7); /* purple-400 with opacity */
  border-radius: 3px;
}

.novel-introduction-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 90, 243, 0.9); /* darker purple */
}
</style>