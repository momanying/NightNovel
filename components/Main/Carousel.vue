<template>
  <div class="relative w-full overflow-hidden rounded-lg shadow-md">
    <!-- 轮播图主体内容 -->
    <div class="flex w-full transition-transform duration-500" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <div 
        v-for="(group, groupIndex) in novelGroups" 
        :key="groupIndex" 
        class="flex-none w-full flex justify-between gap-5 p-5"
      >
        <div 
            v-for="novel in group" 
          :key="novel.id" 
          class="flex-1 relative rounded-lg overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          @click="navigateToNovel(novel.id)"
        >
          <img 
            class="w-70 h-70 object-cover rounded-lg transition-transform duration-500 hover:scale-105"
            :src="novel.cover" 
            :alt="novel.title" 
            @error="handleImageError"
          >
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white rounded-b-lg">
            <h3 class="text-lg font-medium mb-1">{{ novel.title }}</h3>
            <p class="text-sm text-gray-300">{{ novel.author }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 轮播图控制按钮 -->
    <button 
      class="absolute top-1/2 left-2.5 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentSlide === 0"
      @click="prevSlide" 
    >
      <font-awesome-icon :icon="['fas', 'chevron-left']" />
    </button>
    <button 
      class="absolute top-1/2 right-2.5 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-70 transition-opacity hover:opacity-100 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="currentSlide === novelGroups.length - 1"
      @click="nextSlide" 
    >
      <font-awesome-icon :icon="['fas', 'chevron-right']" />
    </button>
    
    <!-- 轮播图指示器 -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5">
      <span 
        v-for="(_, index) in novelGroups" 
        :key="index" 
        class="w-3 h-3 rounded-full bg-white/50 cursor-pointer transition-all duration-300"
        :class="{ 'bg-orange-500 scale-110': currentSlide === index }"
        @click="goToSlide(index)" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义小说类型接口
interface Novel {
  id: number;
  title: string;
  author: string;
  cover: string;
  description?: string;
}

// 接收小说数据
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
    default: 5000 // 5秒
  }
});

// 将小说分组，每组4本
const novelGroups = computed(() => {
  const groups: Novel[][] = [];
  for (let i = 0; i < props.novels.length; i += 4) {
    groups.push(props.novels.slice(i, i + 4));
  }
  return groups;
});

// 当前显示的轮播页索引
const currentSlide = ref(0);

// 轮播图控制
const nextSlide = () => {
  if (currentSlide.value < novelGroups.value.length - 1) {
    currentSlide.value++;
  } else {
    currentSlide.value = 0; // 循环到第一页
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  } else {
    currentSlide.value = novelGroups.value.length - 1; // 循环到最后一页
  }
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

// 自动轮播
let autoplayInterval: ReturnType<typeof setInterval> | null = null;

const startAutoplay = () => {
  if (props.autoplay && novelGroups.value.length > 1) {
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, props.interval);
  }
};

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
  }
};

// 导航到小说详情页
const navigateToNovel = (id: number) => {
  localStorage.setItem('novelId', id.toString());
  const path = `/novels/${id}`;
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.location.href = path;
  }
};

// 图片加载错误处理
const handleImageError = (e: Event) => {
  if (e.target && e.target instanceof HTMLImageElement) {
    e.target.src = 'https://placehold.co/200x300/cccccc/333333?text=加载失败';
  }
};

// 生命周期钩子
onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script> 