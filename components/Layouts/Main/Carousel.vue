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
          <NuxtImg 
            :src="novel.cover_url" 
            :alt="novel.title" 
            class="w-full h-full object-cover rounded-lg"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            format="webp" />
        </li>
      </ul>
    </div>

    <!-- 右侧：小说详情区域 -->
    <div v-if="items.length > 0 && items[current]" class="w-[500px] h-full flex flex-col py-7 pl-6">
        <h2 class="text-2xl font-semibold mb-3 text-purple-400 truncate w-full break-words">{{ items[current].title }}</h2>
        <p class="text-sm text-gray-300 mb-1">作者: {{ items[current].author }}</p>
        <p class="text-sm text-gray-300 mb-1">标签: {{ items[current].tags }}</p>
        <p class="text-sm text-gray-300 mb-1">评分: {{ items[current].rating }}</p>
        <p class="text-gray-300 text-sm mt-4 pr-2 text-justify leading-relaxed line-clamp-5">
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
      cover_url: '/favicon.ico', // 使用项目根目录下public文件夹中已有的图标
      author: 'N/A',
      introduction: '敬请期待更多精彩内容。',
    });
  }
  return result.slice(0, 5); // 确保最终返回不超过5个元素
});

const getStyle = (itemIndex: number) => {
  const relativePosition = (itemIndex - current.value + items.value.length) % items.value.length;
  return animations[relativePosition] || {}; // Fallback to empty object
};

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
/* 若使用了 line-clamp 只需确保配置 tailwind.config.js 启用 line-clamp 插件，否者不需要额外样式 */
</style>
