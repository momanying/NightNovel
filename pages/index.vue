<template>
  <div>
    <LayoutsTheHeader />
    <div class="flex items-start w-full p-0 m-0 min-h-screen">
      <!-- 左侧栏 -->
      <div class="w-[320px] shrink-0 sticky top-[60px] py-4 pl-6">
        <LayoutsLeftSidebar />
      </div>

      <!-- 主容器 -->
      <div class="flex-1 py-10 pl-5">
        <LayoutsMainContainer />
      </div>
    </div>
  </div>
</template>

<script setup>
// 这里可以添加页面特定的逻辑
</script>
