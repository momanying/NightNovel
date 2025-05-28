<template>
  <!-- 桌面版菜单 -->
  <div v-if="!mode || mode === 'desktop'" class="items-center ml-3">
    <div class="flex items-center">
      <NuxtLink to="/articlelist" class="flex items-center justify-center mt-1.5 leading-5 inline-block px-1 cursor-pointer">
        <span class="text-white px-2 pb-1 flex place-items-center">轻小说全集</span>
      </NuxtLink>
      <ul class="flex ml-2 gap-2">
        <li
          v-for="(item, index) in dynamicMenuItems" 
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
              class="w-auto min-w-[120px] max-h-[400px] overflow-y-auto absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-md z-50 rounded-md"
              @mouseenter="cancelCloseMenu"
              @mouseleave="delayedCloseMenu"
            >
              <NuxtLink
                v-for="(subItem, subIndex) in item.subItems"
                :key="subIndex"
                :to="typeof subItem === 'string' ? `/articlelist?category=${encodeURIComponent(subItem)}` : subItem.path"
                class="block p-2.5 leading-7 text-gray-600 no-underline hover:bg-gray-100"
                @click="navigateAndCloseMenu"
              >
                {{ typeof subItem === 'string' ? subItem : subItem.name }}
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
    
    <div v-for="(item, index) in dynamicMenuItems" :key="index" class="mb-3">
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
          :to="typeof subItem === 'string' ? `/articlelist?category=${encodeURIComponent(subItem)}` : subItem.path"
          class="block py-2 text-gray-100 hover:text-white"
          @click="navigateAndCloseMenu"
        >
          {{ typeof subItem === 'string' ? subItem : subItem.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface SubItemObject {
  name: string;
  path: string;
}

interface MenuItem {
  title: string;
  subItems: string[] | SubItemObject[];
  isDynamic: boolean;
}

interface Props {
  mode?: 'desktop' | 'mobile';
}
const _props = defineProps<Props>();

const emit = defineEmits(['navigate']);
const activeIndex = ref<number | null>(null);
const mobileActiveIndex = ref<number | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const navigate = () => { emit('navigate'); };
const navigateAndCloseMenu = () => {
  activeIndex.value = null;
  mobileActiveIndex.value = null;
  emit('navigate');
};

const toggleMobileSubmenu = (index: number) => {
  if (mobileActiveIndex.value === index) {
    mobileActiveIndex.value = null;
  } else {
    mobileActiveIndex.value = index;
    activeIndex.value = null; 
  }
};

const openMenu = (index: number) => {
  if (closeTimer) clearTimeout(closeTimer);
  activeIndex.value = index;
  mobileActiveIndex.value = null; 
};

const delayedCloseMenu = () => {
  closeTimer = setTimeout(() => { activeIndex.value = null; }, 300);
};

const cancelCloseMenu = () => { if (closeTimer) clearTimeout(closeTimer); };

const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  const height = element.scrollHeight;
  element.style.height = '0px';
  requestAnimationFrame(() => { element.style.height = `${height}px`; });
  element.addEventListener('transitionend', done, { once: true });
};

const baseMenuItems: MenuItem[] = [
  {
    title: '文库分类',
    subItems: [] as string[],
    isDynamic: true,
  },
  {
    title: '动漫化作品',
    subItems: [
        { name: 'TV动画化', path: '/articlelist?tag=TV动画化' }, 
        { name: 'OVA动画化', path: '/articlelist?tag=OVA动画化' }, 
        { name: '剧场版', path: '/articlelist?tag=剧场版' }, 
        { name: '真人电影', path: '/articlelist?tag=真人电影' }, 
        { name: '游戏改编', path: '/articlelist?tag=游戏改编' }
    ],
    isDynamic: false,
  },
  {
    title: '今日更新',
    subItems: [
        { name: '最新上架', path: '/articlelist?sort=new' }, 
        { name: '今日更新', path: '/articlelist?sort=today' }, 
        { name: '昨日更新', path: '/articlelist?sort=yesterday' }, 
        { name: '本周更新', path: '/articlelist?sort=thisweek' }, 
        { name: '随机推荐', path: '/articlelist?sort=random' }
    ],
    isDynamic: false,
  },
  {
    title: '已完结作品',
    subItems: [
        { name: '短篇合集', path: '/articlelist?status=finished&tag=短篇' }, 
        { name: '中篇小说', path: '/articlelist?status=finished&tag=中篇' }, 
        { name: '长篇小说', path: '/articlelist?status=finished&tag=长篇' }, 
        { name: '系列作品', path: '/articlelist?status=finished&tag=系列' }, 
        { name: '经典重温', path: '/articlelist?status=finished&tag=经典' }
    ],
    isDynamic: false,
  },
];

const dynamicMenuItems = ref<MenuItem[]>([...baseMenuItems]);

interface CategoryApiResponse {
  status: number;
  message: string;
  data: string[];
  error?: string;
}

async function fetchCategories() {
  try {
    const response = await $fetch<CategoryApiResponse>('/api/novels/categories');
    if (response && response.data) {
      const categoryItem = dynamicMenuItems.value.find(item => item.title === '文库分类' && item.isDynamic);
      if (categoryItem) {
        categoryItem.subItems = response.data;
      }
    }
  } catch (error) {
    console.error('Failed to fetch categories for menu:', error);
    const categoryItem = dynamicMenuItems.value.find(item => item.title === '文库分类' && item.isDynamic);
    if (categoryItem) {
      categoryItem.subItems = [];
    }
  }
}

onMounted(() => { fetchCategories(); });

</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: height 0.3s ease, opacity 0.3s ease; /* Added opacity transition */
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  height: 0 !important;
  opacity: 0; /* Start/end with opacity 0 */
}
.dropdown-enter-to, .dropdown-leave-from {
  opacity: 1;
}
</style>
