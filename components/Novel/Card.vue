<template>
    <div class="w-full text-white rounded-lg shadow-lg">
      <div v-if="novel">
        <div class="flex">
          <div class="w-3/5">

             <NovelCardNovelInfo :novel="novel"/>

          </div>
          <div class="w-2/5 ml-10">

              <NovelCardPopularComment />

          </div>  
        </div> 
      </div>
      <div v-else class="text-center py-10">
         <p>加载小说信息...</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novel';
import type { Tag } from '~/types/tag';

// 获取路由参数
const route = useRoute();
const novelId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] : id;
});

// TagCloud 相关状态
const tagLoading = ref(true);
const tagError = ref('');

// 修改类型为Novel的扩展类型
const novel = ref<Novel & {
  cover?: string;
  description?: string;
  updateTime?: string;
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
        id: novelId.value,
        title: '败犬女主太多了',
        author: '雨森焚火',
        cover: 'http://54.255.84.100/i/2025/04/11/67f8cf4ed464c.jpg',
        cover_url: 'http://54.255.84.100/i/2025/04/11/67f8cf4ed464c.jpg', // 添加cover_url字段
        category: '校园恋爱',
        status: '连载中',
        views: 15632,
        word_count: 793003, // 添加word_count字段
        description: '"为什么……为什么我会输给那种家伙？" 故事开始于面向未来的失恋。输给发小、暗恋对象的我——温水和彦，在高中生活第一天就意志消沉。这时，坐在我旁边的是……之前拒绝了和我发小告白的同班同学？恋爱败犬们谱写的败者复活战（青春恋爱喜剧），开幕！',
        tags: [ // 添加模拟标签数据
          { id: 3, name: "校园", count: 765 },
          { id: 6, name: "恋爱", count: 687 },
          { id: 10, name: "搞笑", count: 472 },
          { id: 12, name: "日常", count: 385 },
        ],
        updateTime: '2025-04-11',
        rating: 9.9,
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
</script>
