<template>
  <div class="bg-gradient-to-r from-blue-900 to-purple-900 z-10 relative w-full">
    <!-- 桌面版导航 -->
    <div class="hidden md:flex h-20 items-center px-3 sm:px-5 box-border">
      <!-- 左侧标题区域 -->
      <div class="flex items-center shrink-0">
        <img class="h-9 w-9 md:h-11 md:w-11 rounded-full" src="/default-cover.webp" alt="Logo" >
        <div class="mt-0.5 cursor-pointer" @click="goToHome">
          <span class="bg-gradient-to-r from-yellow-500 to-purple-800 bg-clip-text text-transparent text-xl md:text-2xl tracking-wider font-bold ml-2 md:ml-4 font-kai">夜幕</span>
          <span class="text-white text-xl md:text-2xl tracking-wider font-kai">轻小说</span>
        </div>
      </div>
      
      <!-- 中间菜单区域 -->
      <LayoutsHeaderMenu class="mx-auto" />
      
      <!-- 右侧图标区域 -->
      <div class="flex items-center shrink-0 mr-3">
        <LayoutsHeaderSearch class="mr-3" />
        <LayoutsHeaderUser />
      </div>
    </div>

    <!-- 移动版导航 -->
    <div class="md:hidden flex flex-col w-full">
      <!-- 顶部导航栏 -->
      <div class="h-16 flex items-center justify-between px-3">
        <!-- 左侧Logo和标题 -->
        <div class="flex items-center">
          <img class="h-8 w-8 rounded-full" src="/default-cover.webp" alt="Logo" >
          <div class="mt-0.5 cursor-pointer" @click="goToHome">
            <span class="bg-gradient-to-r from-yellow-500 to-purple-800 bg-clip-text text-transparent text-lg tracking-wider font-bold ml-2 font-kai">夜幕</span>
            <span class="text-white text-lg tracking-wider font-kai">轻小说</span>
          </div>
        </div>

        <!-- 右侧工具栏 -->
        <div class="flex items-center space-x-2">
          <button class="text-white p-1" @click="toggleMobileMenu">
            <font-awesome-icon :icon="['fas', mobileMenuOpen ? 'times' : 'bars']" class="w-5 h-5" />
          </button>
          <LayoutsHeaderSearch class="mr-2" />
          <LayoutsHeaderUser class="mr-2" />
        </div>
      </div>

      <!-- 移动版菜单 -->
      <div v-if="mobileMenuOpen" class="bg-blue-900 bg-opacity-95 px-3 py-4 animate-slideDown">
        <LayoutsHeaderMenu mode="mobile" @navigate="closeMobileMenu" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
const toast = useToast()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 跳转至首页
const goToHome = () => {
  navigateTo('/');
  toast.info('跳转至首页');
  closeMobileMenu();
}

// 切换移动菜单状态
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 关闭移动菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<style scoped>
.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>