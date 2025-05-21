<template>
  <div class="items-center ml-3">
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
          <!-- 只改动这部分 -->
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
              >
                {{ subItem }}
              </NuxtLink>
            </div>
          </transition>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 当前激活的菜单索引
const activeIndex = ref<number | null>(null);

const showMenu = ref(false);

let closeTimer: ReturnType<typeof setTimeout> | null = null;

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
