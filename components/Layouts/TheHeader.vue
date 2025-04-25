<template>
  <div class="h-20 bg-gradient-to-r from-blue-900 to-purple-900 flex items-center px-5 z-10 relative w-full box-border overflow-visible">
    <!-- 左侧标题区域 -->
    <div class="flex items-center">
      <img class="ml-5 h-11 w-11 rounded-full" src="/static/Icon.png" alt="">
      <div class="mt-0.5 cursor-pointer" @click="goToHome">
        <span class="bg-gradient-to-r from-yellow-500 to-purple-800 bg-clip-text text-transparent text-2xl tracking-wider font-bold ml-4 font-kai">夜幕</span>
        <span class="text-white text-2xl tracking-wider font-kai">轻小说</span>
      </div>
    </div>
    
    <!-- 中间菜单区域 -->
    <HeaderMenu />
    
    <!-- 右侧图标区域 -->
    <div class="flex ml-auto items-center relative">
      <div class="flex items-center">
        
          <HeaderSearch class="flex-1 mr-5"/>

          <HeaderUser /> 

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
const toast = useToast()

// 跳转至首页
const goToHome = () => {
  navigateTo('/');
  toast.info('跳转至首页');
}
</script>