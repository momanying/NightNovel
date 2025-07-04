<template>
    <div class="w-full">
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <div class="p-2 bg-white rounded-xl shadow-lg inline-block">
                    <img 
                    :src="novel?.cover_url" 
                    :alt="novel?.title" 
                    class="w-full h-full rounded-md object-cover"
                    >
                </div>
            </div>
            <div class="flex-1 ml-5">
                <p class="mb-2 font-semibold ">{{ novel?.title || '加载中...' }}</p>
                <p class="mb-2 text-xs "><span class="font-semibold">作者：</span>{{ novel?.author || '未知' }}</p>
                <p class="mb-2 text-xs "><span class="font-semibold">分类：</span>{{ novel?.category || '未分类' }}</p>
                <p class="mb-2 text-xs "><span class="font-semibold">状态：</span>{{ novel?.status || '连载中' }}</p>
                <p class="mb-2 text-xs "><span class="font-semibold">阅读量：</span>{{ novel?.views || 0 }}</p>
                <p class="mb-2 text-xs "><span class="font-semibold">更新时间：</span>{{ novel?.lastUpdate || '暂无更新时间' }}</p>
                <div class="mb-2 flex items-center text-xs">
                <span>标签：</span>
                <a
                    v-for="tag in tagList"
                    :key="tag"
                    class="inline-block mr-2 text-xs hover:scale-105 transition-transform duration-200 border border-gray-300 px-1 rounded-[3px]"
                    @click.prevent="navigateToTag(tag)"
                    >
                    {{ tag }}
                </a>
                </div>
                <p class="mb-2 text-xs leading-[20px]"><span class="font-semibold">简介：</span>{{ novel?.introduction || '暂无简介' }}</p>
                <div class="flex gap-4 mt-4">
                    <button class="px-5 py-2 bg-orange-600 hover:bg-orange-700 rounded-md transition duration-200" @click="navigateToChapters">开始阅读</button>
                    <button 
                      class="px-5 py-2 rounded-md transition duration-200 text-white"
                      :class="isCollected ? 'bg-gray-400 hover:bg-gray-500' : 'bg-sky-600 hover:bg-sky-700'"
                      :disabled="isTogglingCollect"
                      @click="toggleCollect"
                    >
                      {{ buttonText }}
                    </button>
                </div>
            </div>
        </div>  
    </div>
</template>

<script setup lang="ts">
import type { Novel } from '~/types/novel/novelinfo'
import { useUserStore } from '~/stores/user';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  novel: Novel,
  autoplay?: boolean,
  interval?: number
}>()

const userStore = useUserStore();
const toast = useToast();

const tagList = computed(() => {
    if (!props.novel || !props.novel.tags) return []
    return props.novel.tags.split(' ').filter(Boolean)
})


const isCollected = ref(false)
const isTogglingCollect = ref(false);

const buttonText = computed(() => {
  if (isTogglingCollect.value) return '处理中...';
  return isCollected.value ? '已在书架' : '加入书架';
});

const checkCollectionStatus = async () => {
  if (!userStore.token || !props.novel?._id) {
    isCollected.value = false;
    return;
  }
  try {
    const response = await $fetch<{ isCollected: boolean }>('/api/user/bookshelf/status', {
      query: { novelId: props.novel._id },
      headers: { Authorization: `Bearer ${userStore.token}` }
    });
    isCollected.value = response.isCollected;
  } catch (error) {
    console.error('Failed to check collection status:', error);
    isCollected.value = false;
  }
};

watch(() => props.novel?._id, (newId) => {
  if (newId) {
    checkCollectionStatus();
  }
}, { immediate: true });


// 导航到章节列表页面
const navigateToChapters = () => {
  if (!props.novel || !props.novel._id) return
  navigateTo(`/novels/${props.novel._id}/list`);
};

// 切换收藏状态
const toggleCollect = async () => {
  if (!userStore.token) {
    toast.info('请先登录再操作');
    return navigateTo('/auth/login');
  }

  if (!props.novel?._id || isTogglingCollect.value) return;

  isTogglingCollect.value = true;
  try {
    if (isCollected.value) {
      // Remove
      await $fetch('/api/user/bookshelf/remove', {
        method: 'POST',
        body: { novelId: props.novel._id },
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      isCollected.value = false;
      toast.success('已从书架移除');
    } else {
      // Add
      await $fetch('/api/user/bookshelf/add', {
        method: 'POST',
        body: { novelId: props.novel._id },
        headers: { Authorization: `Bearer ${userStore.token}` }
      });
      isCollected.value = true;
      toast.success('成功加入书架');
    }
  } catch (error: unknown) {
    console.error('Failed to toggle collection status:', error);
    const errorMessage = (error as { data?: { message: string } })?.data?.message || '操作失败';
    toast.error(errorMessage);
  } finally {
    isTogglingCollect.value = false;
  }
};

// 导航到标签页面
const navigateToTag = (tagId: string | number) => {
  navigateTo(`/articlelist?tag=${tagId}&order=desc&page=1`);
};
</script>