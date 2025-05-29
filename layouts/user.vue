<template>
  <div>
    <!-- 复用默认布局的背景层 -->
    <div class="layer1" />
    <div class="layer2" />
    <div class="layer3" />
    <div class="layer4" />
    <div class="layer5" />
    
    <!-- Overall page structure for the user section -->
    <div class="h-screen w-full">

      <LayoutsHeaderContainer />

      <!-- Main content area: Sidebar + Page Content -->
      <div class="h-full flex flex-1 my-5 w-full px-4 sm:px-6 lg:px-8">

        <div class="w-64 h-full bg-gray-700/50 text-gray-300 border-r border-gray-700 rounded-lg p-5 shadow-xl flex flex-col">
          <nav class="flex-grow space-y-1 overflow-y-auto pr-1">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors duration-150"
              :class="isActive(item.to) ? 'bg-sky-900 text-white shadow-sm' : 'text-gray-300'"
            >
              <!-- Assuming you have Font Awesome setup via a plugin or globally -->
              <font-awesome-icon :icon="item.icon" class="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </nav>
        </div>

        <main class="flex-1 overflow-auto ml-4">
          <slot /> 
        </main>

      </div>

      <LayoutsFooter />

    </div>

  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'; // useRouter for navigation

const route = useRoute();

interface NavigationItem {
  name: string;
  to: string;
  icon: string[]; // Changed to string array for [prefix, iconName]
}

// Adjusted icon definitions for FontAwesomeIcon component
const navigationItems: NavigationItem[] = [
  { name: '个人信息', to: '/user/info', icon: ['fas', 'user-circle'] },
  { name: '头像上传', to: '/user/avatar', icon: ['fas', 'image'] },
  { name: '修改密码', to: '/user/password', icon: ['fas', 'key'] },
  { name: '我的收藏', to: '/user/collection', icon: ['fas', 'bookmark'] },
  { name: '设置', to: '/user/settings', icon: ['fas', 'cog'] }, // 'fas' for solid, 'far' for regular etc.
];


const isActive = (path: string) => {
  if (path === '/user/info' && route.path === '/user') {
    return true;
  }
  return route.path === path || route.path.startsWith(`${path}/`);
};
</script>