<template>
  <div>
    <LayoutsHeaderContainer/>

    <div class="mx-[300px] h-[100vh] p-4">
      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"/>
        <p class="ml-4 text-lg text-gray-600 dark:text-gray-400">加载中...</p>
      </div>

      <div v-else-if="!comment" class="text-center py-10">
        <p class="text-xl text-gray-500 dark:text-gray-400">评论未找到或加载失败。</p>
      </div>
      
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center">
            <img 
              :src="comment.user?.avatar || '/images/default-avatar.png'" 
              :alt="comment.user?.username || '用户'" 
              class="w-10 h-10 rounded-full mr-3 border-2 border-gray-200 dark:border-gray-700"
            >
            <div>
              <span class="font-semibold text-gray-800 dark:text-gray-200 text-md">{{ comment.user?.username || '匿名用户' }}</span>
              <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Icon name="ph:calendar-blank-light" class="w-3 h-3 mr-1" />
                {{ formatDate(comment.createdAt) }}
              </div>
            </div>
          </div>
          <div v-if="comment.rating" class="flex items-center text-sm text-yellow-500">
            <Icon 
              v-for="i in 5" 
              :key="i" 
              :name="i <= (comment.rating || 0) ? 'ph:star-fill' : 'ph:star-light'" 
              class="w-4 h-4" 
            />
            <span class="ml-1 font-medium">({{ comment.rating }})</span>
          </div>
        </div>
        
        <h1 v-if="comment.title" class="text-2xl font-bold text-gray-900 dark:text-gray-100 my-4">{{ comment.title }}</h1>

        <div class="prose prose-sm dark:prose-invert max-w-none comment-markdown-content">
          <MdPreview 
            :modelValue="comment.content"
            :editorId="`preview-${comment._id}`" 
            previewTheme="default" 
          />
        </div>

        <div v-if="comment.tags && comment.tags.length > 0" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 mr-2">标签:</span>
          <span 
            v-for="tag in comment.tags" 
            :key="tag"
            class="inline-block bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import type { Comment } from '~/types/comment'; // Ensure this path is correct

interface UserInfo {
  _id: string;
  username: string;
  avatar: string;
}

interface PopularComment extends Omit<Comment, 'user' | 'replies' | 'novelId'> {
  user?: UserInfo; // User can be optional if not always populated
  htmlContent?: string;
  tags?: string[];
  featuredOrder?: number;
  novelId?: string; // novelId might not be on every popular comment if it's generic
  title?: string;
}

const comment = ref<PopularComment | null>(null);
const isLoading = ref(true);
const route = useRoute();

// Fetch a single popular comment by its ID
const fetchCommentById = async (id: string) => {
  try {
    isLoading.value = true;
    const response = await useFetch<{ comment: PopularComment }>(`/api/comments/popular`, { 
      method: 'GET',
      params: { id }
    });
    
    if (response && response.data.value?.comment) {
      comment.value = response.data.value.comment;
    } else {
      comment.value = null;
    }
  } catch (error) {
    console.error(`获取ID为 ${id} 的长评失败:`, error);
    comment.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const commentId = route.params.id;
  if (typeof commentId === 'string' && commentId) {
    fetchCommentById(commentId);
  } else {
    isLoading.value = false;
    comment.value = null;
  }
});

// Format date (similar to PopularComment.vue)
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? '刚刚' : `${diffMinutes}分钟前`;
    }
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

</script>

<style>
.comment-markdown-content img {
  max-width: 100%;
  border-radius: 0.375rem; /* Tailwind's rounded-md */
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.comment-markdown-content a {
  color: #0ea5e9; /* Tailwind's sky-500 */
  text-decoration: none;
}

.comment-markdown-content a:hover {
  text-decoration: underline;
}

.comment-markdown-content pre {
  background-color: #f3f4f6; /* Tailwind's gray-100 */
  border-radius: 0.375rem;
  padding: 0.75rem;
  overflow-x: auto;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875em; /* Slightly smaller for code blocks */
}

.dark .comment-markdown-content pre {
  background-color: #1f2937; /* Tailwind's gray-800 */
}

.comment-markdown-content blockquote {
  border-left-width: 4px;
  border-left-color: #d1d5db; /* Tailwind's gray-300 */
  padding-left: 1rem;
  color: #4b5563; /* Tailwind's gray-600 */
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.dark .comment-markdown-content blockquote {
  border-left-color: #4b5563; /* Tailwind's gray-600 */
  color: #9ca3af; /* Tailwind's gray-400 */
}

/* Add more prose styles if needed for headings, lists, etc. */
.comment-markdown-content h1, .comment-markdown-content h2, .comment-markdown-content h3,
.comment-markdown-content h4, .comment-markdown-content h5, .comment-markdown-content h6 {
  font-weight: 600; /* semibold */
  margin-top: 1em;
  margin-bottom: 0.5em;
  line-height: 1.3;
}

.comment-markdown-content h1 { font-size: 1.875rem; } /* text-2xl */
.comment-markdown-content h2 { font-size: 1.5rem; }    /* text-xl */
.comment-markdown-content h3 { font-size: 1.25rem; }   /* text-lg */

.comment-markdown-content ul, .comment-markdown-content ol {
  padding-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style> 