<template>
  <div>
    <LayoutsTheHeader />
    <div class="flex gap-5 mt-5">

      <NovelCard />

      <NovelPopularComment />

    </div>
    <div class="flex ml-10 mt-5">
      <div class="w-1/2">
        <NovelSameNovel />
      </div>
      <div class="w-1/2">
        <NovelSimilarNovel />
      </div>
    </div>
  </div>
</template>