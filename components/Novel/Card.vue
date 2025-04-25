<template>
    <div class="ml-[40px] max-w-[800px] px-[20px] text-white rounded-lg shadow-lg bottom-0">
      <div v-if="novel">
        <h1 class="text-2xl font-bold mb-5">{{ novel.title }}</h1>
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-full md:w-1/3 flex-shrink-0">
            <img :src="novel.cover" :alt="novel.title" class="w-full h-auto rounded-md shadow-md">
          </div>
          <div class="flex-1">
            <p class="mb-2"><span class="font-semibold">作者：</span>{{ novel.author }}</p>
            <p class="mb-2"><span class="font-semibold">分类：</span>{{ novel.category }}</p>
            <p class="mb-2"><span class="font-semibold">状态：</span>{{ novel.status || '连载中' }}</p>
            <p class="mb-2"><span class="font-semibold">阅读量：</span>{{ novel.views || 0 }}</p>
            <p class="mb-2"><span class="font-semibold">更新时间：</span>{{ novel.updateTime || '暂无更新时间' }}</p>
            <div class="mb-4">
              <span class="font-semibold block">标签：</span>
              <template v-if="tagLoading">加载中...</template>
              <template v-else-if="tagError">{{ tagError }}</template>
              <template v-else-if="novel.tags && novel.tags.length > 0">
                <a
                  v-for="tag in novel.tags"
                  :key="tag.id"
                  href="#"
                  style="font-size: 10px; padding: 5px;"
                  class="inline-block mr-2 mb-1 px-2 py-0.5 rounded text-sm hover:scale-105 transition-transform duration-200"
                  @click.prevent="navigateToTag(tag.id)"
                >
                  <font-awesome-icon :icon="['fas', 'tags']" />{{ tag.name }}
                </a>
              </template>
              <template v-else>暂无标签</template>
            </div>

            <div class="flex gap-4 my-4">
              <button class="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition duration-200" @click="navigateToChapters">开始阅读</button>
              <button class="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-md transition duration-200" @click="toggleCollect">{{ isCollected ? '已收藏' : '加入书架' }}</button>
            </div>
          </div>
        </div>
        
        <div class="mt-8 border-t border-gray-700 pt-6">
          <h3 class="text-xl font-semibold mb-3">简介</h3>
          <p class="text-gray-300 leading-relaxed">{{ novel.description || '暂无简介' }}</p>
        </div>
      </div>
      <div v-else class="text-center py-10">
         <p>加载小说信息...</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Tag } from '~/types/tag';

// 获取路由参数
const route = useRoute();
const novelId = route.params.id;
const isCollected = ref(false);

// TagCloud 相关状态
const tagLoading = ref(true);
const tagError = ref('');

// 示例数据
const novel = ref<{
  id: string | string[];
  title: string;
  author: string;
  cover: string;
  category: string;
  status: string;
  views: number;
  updateTime: string;
  description: string;
  tags?: Tag[];
}>();

// 模拟API请求
onMounted(async () => {
  tagLoading.value = true;
  try {
    // 实际应用中的API调用示例
    // const { data } = await useFetch(`/api/novels/${novelId}`);
    // novel.value = data.value;
    
    // 这里只是模拟延迟加载
    setTimeout(() => {
      novel.value = {
        id: novelId,
        title: '败犬女主太多了',
        author: '雨森焚火',
        cover: 'http://54.255.84.100/i/2025/04/11/67f8cf4ed464c.jpg',
        category: '校园恋爱',
        status: '连载中',
        views: 15632,
        description: '"为什么……为什么我会输给那种家伙？" 故事开始于面向未来的失恋。输给发小、暗恋对象的我——温水和彦，在高中生活第一天就意志消沉。这时，坐在我旁边的是……之前拒绝了和我发小告白的同班同学？恋爱败犬们谱写的败者复活战（青春恋爱喜剧），开幕！',
        tags: [ // 添加模拟标签数据
          { id: 3, name: "校园", count: 765 },
          { id: 6, name: "恋爱", count: 687 },
          { id: 10, name: "搞笑", count: 472 },
          { id: 12, name: "日常", count: 385 },
        ],
        updateTime: '2025-04-11'
      };
      tagLoading.value = false;
    }, 100); // 增加延迟以便观察 loading 状态
  } catch (error) {
    console.error('获取小说详情失败:', error);
    tagError.value = '加载标签失败';
    tagLoading.value = false;
    // 实际应用中可能需要设置 novel.value = null 或显示错误信息
  }
});

// 导航到章节列表页面
const navigateToChapters = () => {
  navigateTo(`/novels/${novelId}/`);
};

// 切换收藏状态
const toggleCollect = () => {
  isCollected.value = !isCollected.value;
  // 实际应用中应调用API保存收藏状态
};

// 导航到标签页面
const navigateToTag = (tagId: number | string) => {
  navigateTo(`/tags/${tagId}`);
};

</script>
