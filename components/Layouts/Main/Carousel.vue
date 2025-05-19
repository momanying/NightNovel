<template>
  <div>
    <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">口碑佳作</h2>
  </div>
  <div class="flex w-[800px] h-[400px] text-white overflow-hidden justify-between">
    <!-- 左侧：轮播区域 -->
    <div class="w-2/5 h-full">
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
    <div  v-if="items.length > 0 && items[current]" class="w-[500px] h-full flex flex-col py-7 pl-6">
        <h2 class="text-2xl font-semibold mb-3 text-purple-400 truncate w-full break-words">{{ items[current].title }}</h2>
        <p class="text-sm text-gray-300 mb-1">作者: {{ items[current].author }}</p>
        <p class="text-gray-300 text-sm mt-4 pr-2 text-justify leading-relaxed" style="max-height: 160px;"> 
          {{ items[current].introduction || '暂无简介' }}
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo';

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
  { left: '55px', top: '8%', opacity: 1, zIndex: 1, width: '180px', height: '230px' }, // 主图，宽度调整为100%相对于其容器（左侧区域的li）
  { left: '50px', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },   // 缩略图1
  { left: '100px', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图2
  { left: '150px', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图3
  { left: '200px', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },  // 缩略图4
];

const current = ref(0); // 追踪 items.value 中作为主图的索引
let timer: NodeJS.Timeout | null = null;
const items = computed<Novel[]>(() => {
  const novelItems = Array.isArray(props.novels) ? props.novels : [];
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