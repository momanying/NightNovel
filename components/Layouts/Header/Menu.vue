<template>
  <!-- 桌面版菜单 -->
  <div v-if="!mode || mode === 'desktop'" class="items-center ml-3">
    <div class="flex items-center">
      <NuxtLink to="/articlelist" class="flex items-center justify-center mt-1.5 leading-5 inline-block px-1 cursor-pointer">
        <span class="text-white px-2 pb-1 flex place-items-center">轻小说全集</span>
      </NuxtLink>
      <ul class="flex ml-2 gap-2">
        <li
          v-for="(item, index) in menuItems"
          :key="index"
          class="flex mr-2.5 items-center justify-center mt-1.5 leading-5 float-left inline-block mx-[-0.5px] px-1 relative cursor-pointer"
          @mouseenter="openMenu(index)"
          @mouseleave="delayedCloseMenu"
        >
          <span class="text-white px-2 pb-1 flex place-items-center">{{ item.title }}</span>
          <transition
            name="dropdown"
            @enter="onEnter"
          >
            <div
              v-show="activeIndex === index"
              ref="dropdown"
              class="w-[110px] absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-50"
              @mouseenter="cancelCloseMenu"
              @mouseleave="delayedCloseMenu"
            >
              <NuxtLink
                v-for="(subItem, subIndex) in item.subItems"
                :key="subIndex"
                class="block p-2.5 leading-7 text-gray-600 no-underline hover:bg-gray-100"
                @click="navigate"
              >
                {{ subItem }}
              </NuxtLink>
            </div>
          </transition>
        </li>
      </ul>
    </div>
  </div>

  <!-- 移动版菜单 -->
  <div v-else-if="mode === 'mobile'" class="w-full">
    <NuxtLink 
      to="/articlelist" 
      class="block py-3 text-white border-b border-blue-800"
      @click="navigate"
    >
      轻小说全集
    </NuxtLink>
    
    <div v-for="(item, index) in menuItems" :key="index" class="mb-3">
      <div 
        class="flex justify-between items-center py-3 text-white border-b border-blue-800 cursor-pointer"
        @click="toggleMobileSubmenu(index)"
      >
        <span>{{ item.title }}</span>
        <font-awesome-icon 
          :icon="['fas', mobileActiveIndex === index ? 'chevron-up' : 'chevron-down']" 
          class="w-4 h-4" 
        />
      </div>
      
      <div v-if="mobileActiveIndex === index" class="pl-4 py-2 bg-blue-800 bg-opacity-50 rounded">
        <NuxtLink
          v-for="(subItem, subIndex) in item.subItems"
          :key="subIndex"
          class="block py-2 text-gray-100 hover:text-white"
          @click="navigate"
        >
          {{ subItem }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件接收mode属性，用于确定显示桌面版还是移动版菜单
defineProps<{
  mode?: 'desktop' | 'mobile'
}>();

// 定义事件
const emit = defineEmits(['navigate']);

// 当前激活的菜单索引
const activeIndex = ref<number | null>(null);
// 移动端激活的子菜单索引
const mobileActiveIndex = ref<number | null>(null);

const showMenu = ref(false);

let closeTimer: ReturnType<typeof setTimeout> | null = null;

// 处理导航事件
const navigate = () => {
  emit('navigate');
};

// 切换移动端子菜单
const toggleMobileSubmenu = (index: number) => {
  if (mobileActiveIndex.value === index) {
    mobileActiveIndex.value = null;
  } else {
    mobileActiveIndex.value = index;
  }
};

const openMenu = (index: number) => {
  if (closeTimer) clearTimeout(closeTimer)
  activeIndex.value = index
}

const delayedCloseMenu = () => {
  closeTimer = setTimeout(() => {
    activeIndex.value = null;
    showMenu.value = false;
  }, 500);
}

const cancelCloseMenu = () => {
  if (closeTimer) {
    clearTimeout(closeTimer);
  }
}

// 添加transition动画控制函数
const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  const height = element.scrollHeight;
  element.style.height = '0px';
  setTimeout(() => {
    element.style.height = `${height}px`;
    done();
  });
}

// 定义菜单数据
const menuItems = [
  {
    title: '热门轻小说',
    subItems: ['周排行榜', '月排行榜', '总排行榜', '热门新作', '人气作家'],
  },
  {
    title: '动漫化作品',
    subItems: ['TV动画化', 'OVA动画化', '剧场版', '真人电影', '游戏改编'],
  },
  {
    title: '今日更新',
    subItems: ['最新上架', '今日更新', '昨日更新', '本周更新', '随机推荐'],
  },
  {
    title: '已完结作品',
    subItems: ['短篇合集', '中篇小说', '长篇小说', '系列作品', '经典重温'],
  },
];
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  height: 0 !important;
}
</style>
