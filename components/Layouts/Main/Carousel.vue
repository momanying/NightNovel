<template>
  <div>
    <h2 class="text-xl font-bold border-l-4 border-indigo-600 pl-3 mb-4 text-white">口碑佳作</h2>
  </div>
  <!-- 使用响应式布局 -->
  <div class="flex flex-col lg:flex-row w-full lg:h-[400px] text-white overflow-hidden justify-between">
    <!-- 左侧：轮播区域 - 在移动设备上占满宽度，在桌面上占40% -->
    <div class="w-full lg:w-2/6 h-[300px] lg:h-full lg:mb-0">
      <ul class="relative w-full h-full overflow-hidden rounded-lg">
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

    <!-- 右侧：小说详情区域 - 在移动设备上占满宽度，在桌面上占60% -->
    <div v-if="items.length > 0 && items[current]" class="w-full lg:w-4/6 h-full flex flex-col py-4 lg:py-7 lg:pr-10">
        <h2 class="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-purple-400 truncate w-full break-words">{{ items[current].title }}</h2>
        <p class="text-sm text-gray-300 mb-1">作者: {{ items[current].author }}</p>
        <p class="text-sm text-gray-300 mb-1">标签: {{ items[current].tags }}</p>
        <p class="text-sm text-gray-300 mb-1">评分: {{ items[current].rating }}</p>
        <p class="text-gray-300 text-sm mt-3 lg:mt-4 pr-2 text-justify leading-relaxed line-clamp-4 lg:line-clamp-5">
          {{ items[current].introduction || '暂无简介' }}
        </p>
        <!-- 在移动视图中添加一个阅读按钮 -->
        <div class="mt-4 lg:hidden">
          <button 
            class="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-full text-sm transition duration-300"
            @click="navigateToNovelPage(items[current]._id)"
          >
            阅读详情
          </button>
        </div>
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

// 检测是否为移动设备
const isMobile = ref(false);

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile);
});

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg断点
};

// 根据设备类型设置不同的动画位置
const getAnimations = () => {
  if (isMobile.value) {
    // 移动设备上只显示当前图片
    return [
      { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 1, zIndex: 5, width: '180px', height: '230px' },
      { opacity: 0, width: '0', height: '0' },
      { opacity: 0, width: '0', height: '0' },
      { opacity: 0, width: '0', height: '0' },
      { opacity: 0, width: '0', height: '0' },
    ];
  } else {
    // 桌面设备上的位置设置
    return [
      { left: '20%', top: '8%', opacity: 1, zIndex: 5, width: '180px', height: '230px' }, 
      { left: '16%', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },
      { left: '31%', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },
      { left: '46%', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },
      { left: '61%', top: '70%', opacity: 0.7, zIndex: 2, width: '50px', height: '70px' },
    ];
  }
};

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
  return getAnimations()[relativePosition] || {}; // 使用动态动画配置
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
