<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">我的书架</h1>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="w-12 h-12 border-4 border-t-transparent border-gray-300 rounded-full animate-spin" />
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="bookmarks.length === 0" class="text-center py-12">
      <p class="text-gray-500">你的书架中还没有小说，去添加一些吧！</p>
      <NuxtLink to="/" class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        探索小说
      </NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex p-4">
          <div class="w-24 h-32 flex-shrink-0">
            <img 
              :src="bookmark.novel.cover_url" 
              :alt="bookmark.novel.title"
              class="w-full h-full object-cover"
              @error="handleImageError"
            >
          </div>
          <div class="ml-4 flex flex-col flex-grow">
            <h3 class="font-bold text-lg">{{ bookmark.novel.title }}</h3>
            <p class="text-sm text-gray-600">{{ bookmark.novel.author }}</p>
            <p class="text-xs text-gray-500 mt-1">
              最近阅读：{{ formatDate(bookmark.updatedAt) }}
            </p>
            <div class="mt-auto flex">
              <button 
                class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded mr-2"
                @click="continueReading(bookmark)" 
              >
                继续阅读
              </button>
              <button 
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                @click="removeFromBookshelf(bookmark.id)" 
              >
                移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
const { token } = storeToRefs(userStore);
const router = useRouter();

// 书签类型定义
interface Bookmark {
  id: string;
  novelId: string;
  chapterId?: string;
  updatedAt: string;
  novel: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
  };
}

interface BookshelfResponse {
  code: number;
  message: string;
  data?: {
    bookmarks: Bookmark[];
  } | null;
  error?: string;
}

interface RemoveBookmarkResponse {
  code: number;
  message: string;
  data?: {
    bookmarkId: string;
  } | null;
  error?: string;
}

// 响应式状态
const loading = ref(true);
const error = ref('');
const bookmarks = ref<Bookmark[]>([]);

// 检查用户登录状态
onMounted(() => {
  // 使用计算属性检查登录状态
  if (!token.value) {
    router.push('/auth/login');
    return;
  }
  
  // 已登录，获取书架数据
  fetchBookshelf();
});

// 获取书架数据
const fetchBookshelf = async () => {
  if (!token.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await $fetch<BookshelfResponse>('/api/user/bookshelf', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    
    if (response.code === 200 && response.data?.bookmarks) {
      bookmarks.value = response.data.bookmarks;
    } else {
      error.value = response.message || '获取书架失败';
    }
  } catch (err) {
    console.error('获取书架失败:', err);
    error.value = '获取书架失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};

// 从书架中移除小说
const removeFromBookshelf = async (bookmarkId: string) => {
  try {
    const response = await $fetch<RemoveBookmarkResponse>('/api/user/bookshelf/remove', {
      method: 'POST',
      body: { bookmarkId },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    
    if (response.code === 200) {
      bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
    } else {
      error.value = response.message || '移除失败';
    }
  } catch (err) {
    console.error('移除书架失败:', err);
    error.value = '移除失败，请稍后再试';
  }
};

// 继续阅读
const continueReading = (bookmark: Bookmark) => {
  // 如果有章节ID，跳转到上次阅读的章节，否则跳转到小说详情页
  if (bookmark.chapterId) {
    router.push(`/novels/${bookmark.novelId}/${bookmark.chapterId}`);
  } else {
    router.push(`/novels/${bookmark.novelId}`);
  }
};

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = '/images/default-cover.jpg';
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
</script> 