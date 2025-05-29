<template>
  <div class="min-h-screen flex flex-col">
    <LayoutsHeaderContainer />

    <div class="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 在移动设备上，主内容区域在下方；在桌面上，主内容区域在左侧 -->
        <div class="w-full lg:flex-1 order-2 lg:order-1">
          <LayoutsMainContainer />
        </div>
        <!-- 在移动设备上，侧边栏在上方；在桌面上，侧边栏在右侧 -->
        <div class="w-full lg:w-72 xl:w-80 shrink-0 order-1 lg:order-2">
          <LayoutsSideBarContainer />
        </div>
      </div> 
    </div>

    <LayoutsFooter />
  </div>
</template>