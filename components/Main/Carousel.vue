<template>
  <div class="relative h-[400px] w-full">
    <div class="h-full overflow-hidden">
      <!-- 书籍轮播区域 -->
      <ul class="flex h-full">
        <li 
          v-for="(novel, index) in novels.slice(0, 5)" 
          :key="novel._id"
          class="cursor-pointer absolute overflow-hidden transition-all duration-500 ease-out shadow-md hover:shadow-xl rounded-lg transform origin-bottom"
          :style="getStyle(index)"
          @click="onClick(novel._id)"
        >
          <div class="relative w-full h-full group">
            <img 
              :src="novel.cover_url" 
              :alt="novel.title" 
              class="w-full h-full object-cover rounded-lg"
              @error="handleImageError"
            >
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p class="text-white font-bold truncate">{{ novel.title }}</p>
              <p class="text-white/80 text-sm truncate">{{ novel.author }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- 指示器 -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
      <button 
        v-for="(_, i) in novels.slice(0, 5)" 
        :key="i"
        :class="[
          'w-2 h-2 rounded-full transition-all duration-300',
          current === i ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
        ]"
        :aria-label="`转到第${i+1}页`"
        @click="goToSlide(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义小说类型接口
import type { Novel } from '~/types/novel/novelinfo';

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
    default: 3000 // 3秒
  }
});

const animations = [
  { left: '0%', top: '30px', opacity: 0.4, zIndex: 1,  width: '130px', height: '200px' },
  { left: '20%', top: '10px', opacity: 0.7, zIndex: 2,  width: '130px', height: '200px' },
  { left: '40%', top: '0px', opacity: 1, zIndex: 3,  width: '130px', height: '200px' },
  { left: '60%', top: '10px', opacity: 0.7, zIndex: 2,  width: '130px', height: '200px' },
  { left: '80%', top: '30px', opacity: 0.4, zIndex: 1,  width: '130px', height: '200px' },
]

// 当前选中的索引
const current = ref(0);

let timer: NodeJS.Timeout | null = null;

const items = computed(() => {
  // 确保至少有5个项目以填充轮播
  if (props.novels.length >= 5) {
    return props.novels.slice(0, 5);
  } else {
    // 如果不足5个，使用占位符填充
    const result = [...props.novels];
    while (result.length < 5) {
      result.push({
        _id: `placeholder-${result.length}`,
        title: '占位',
        cover_url: '/images/default-cover.jpg',
        author: '',
        introduction: ''
      } as Novel);
    }
    return result;
  }
});

const getStyle = (index: number) => {
  const position = (index - current.value + items.value.length) % items.value.length;
  const ani = animations[position];
  return {
    left: ani.left,
    top: ani.top,
    opacity: ani.opacity,
    zIndex: ani.zIndex,
    width: ani.width,
    height: ani.height
  }
}

const next = () => {
  current.value = (current.value + 1) % items.value.length;
}

const prev = () => {
  current.value = (current.value - 1 + items.value.length) % items.value.length;
}

const goToSlide = (index: number) => {
  stop();
  current.value = index;
  setTimeout(start, 500);
}

const start = () => {
  // 先清除可能存在的计时器
  stop();
  
  // 设置新的计时器
  if (props.autoplay && items.value.length > 1) {
    timer = setInterval(() => {
      next();
    }, props.interval);
  }
}

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

const moveToCenter = (steps: number, callback?: () => void) => {
  if (steps <= 0) {
    if (callback) callback();
    return;
  }
  
  prev();
  setTimeout(() => {
    moveToCenter(steps - 1, callback);
  }, 500); // 500ms和transition-duration对齐
}

const moveToCenterReverse = (steps: number, callback?: () => void) => {
  if (steps <= 0) {
    if (callback) callback();
    return;
  }
  
  next();
  setTimeout(() => {
    moveToCenterReverse(steps - 1, callback);
  }, 500);
}

// 图片错误处理
const handleImageError = (e: Event) => {
  if (e.target && e.target instanceof HTMLImageElement) {
    e.target.src = '/images/default-cover.jpg';
  }
}

const onClick = (id: string | undefined) => {
  // 检查ID是否为占位符ID
  if (!id || (typeof id === 'string' && id.startsWith('placeholder-'))) {
    return; // 不处理占位符ID或空ID的点击
  }
  
  // 找到点击的小说在数组中的索引
  const clickedIndex = items.value.findIndex(novel => novel._id === id);
  if (clickedIndex === -1) return;
  
  // 计算点击项与当前中心项的位置关系
  const position = (clickedIndex - current.value + items.value.length) % items.value.length;
  
  // 如果点击的是中心位置(position === 2，对应animations中索引2的位置)，则跳转到详情页
  if (position === 2) {
    localStorage.setItem('novelId', String(id));
    const path = `/novels/${id}`;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.location.href = path;
    }
  } else {
    stop(); // 停止自动轮播
    
    // 确定最短路径转到中心
    if (position < 2) {
      // 向右移动(使用next)，例如位置1到位置2需要移动1步
      const stepsToCenter = 2 - position;
      moveToCenter(stepsToCenter, start); // 完成后重新开始自动轮播
    } else {
      // 向左移动(使用prev)，例如位置3到位置2需要移动1步
      const stepsToCenter = position - 2;
      moveToCenterReverse(stepsToCenter, start); // 完成后重新开始自动轮播
    }
  }
}

onMounted(() => {
  start();
})

onBeforeUnmount(() => {
  stop();
})
</script>

<style scoped>
li {
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

li:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 10 !important;
}
</style>