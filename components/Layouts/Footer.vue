<template>
    <div class="bg-gray-900 py-6 gap-4 border-t border-divide border-gray-700">
        <div class="container mx-auto px-4">
            <!-- 桌面版布局 -->
            <div class="hidden md:flex justify-between items-center">
                <div class="text-sm text-gray-600">
                    &copy; 2025 夜幕轻小说. 版权所有.
                </div>
                <div class="flex space-x-6">
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition">
                        友情链接
                    </a>
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition inline-flex items-baseline gap-1" @click="navigateTo('https://github.com/momanying/NightNovel')">
                        <font-awesome-icon :icon="['fab', 'github']" :style="{ height: '13px', width: '13px' }"/>github仓库
                    </a>
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition">
                        开发文档
                    </a>
                </div>
            </div>
            
            <!-- 移动版布局 -->
            <div class="md:hidden flex flex-col space-y-6">
                <!-- 第一行: 版权信息 -->
                <div class="text-sm text-gray-600 text-center">
                    &copy; 2025 夜幕轻小说. 版权所有.
                </div>
                
                <!-- 第二行: 友情链接和Github -->
                <div class="flex justify-center space-x-6">
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition">
                        友情链接
                    </a>
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition inline-flex items-center gap-1" @click="navigateTo('https://github.com/momanying/NightNovel')">
                        <font-awesome-icon :icon="['fab', 'github']" :style="{ height: '13px', width: '13px' }"/>Github
                    </a>
                    <a href="#" class="text-gray-600 hover:text-gray-300 transition">
                        开发文档
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const navigateTo = (url : string) => {
  // 在新标签页打开
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.focus();
  }
};
</script>