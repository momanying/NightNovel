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

        <UserSideBar />

        <main class="flex-1 overflow-auto ml-4">
          <slot /> 
        </main>

      </div>

      <LayoutsFooter />

    </div>

  </div>
</template>