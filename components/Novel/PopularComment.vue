<template>
  <div class="min-h-[400px]">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="title-h2">精华书评</h2>
      </div>
      <div v-if="comments.length > 0" class="flex justify-end">
        <button 
          class="px-4 py-2 bg-sky-500 hover:bg-primary-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="openCommentModal"
        >
          写评论
        </button>
      </div>
    </div>
    
    <div class="flex flex-col mt-2 rounded-lg overflow-hidden">
      <!-- 无数据状态 -->
      <div v-if="comments.length === 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center my-4">
        <Icon name="ph:book-open-text" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500 dark:text-gray-400 mb-2">还没有书评，快来写下你的感想吧！</p>
        <button 
          class="mt-2 px-4 py-2 bg-sky-500 hover:bg-primary-600 text-white rounded-md transition-colors duration-200"
          @click="openCommentModal"
        >
          写第一条评论
        </button>
      </div>
      
      <!-- 评论列表 -->
      <NuxtLink
        v-for="comment in comments"
        v-else
        :key="comment._id" 
        :to="`/comments/${comment._id}`"
        class="bg-gray-50 dark:bg-gray-800 p-4 shadow-sm border-b border-dashed border-gray-700 last:border-b-0"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <img :src="comment.user.avatar" :alt="comment.user.username" class="w-8 h-8 rounded-full mr-2">
            <span class="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-[80px]">{{ comment.user.username }}</span>
            <div class="ml-4 flex items-center space-x-1">
              <font-awesome-icon v-for="i in 5" :key="i" :icon="['fas', 'star']" :class="i <= comment.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'" :style="{ width: '0.875rem', height: '0.875rem' }"/>
            </div>
          </div>
          <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
        </div>

        <h2 class="text-gray-800 dark:text-gray-200 text-lg text-shadow-sm font-bold my-2 ml-1">{{ comment.title }}</h2>
        
        <!-- 渲染 Markdown 内容 -->
        <div v-if="isExpanded[comment._id]" class="comment-content">
          <MdPreview :modelValue="processMarkdownImages(comment.content)" previewTheme="default" />
        </div>
        
        <!-- 折叠预览 -->
        <div v-else class="line-clamp-3 text-gray-700 dark:text-gray-300 text-xs mb-2">
          {{ stripMarkdown(comment.content) }}
        </div>
        
      </NuxtLink>
    </div>
    

    <!-- 评论编辑器模态框 -->
    <Teleport to="body">
      <div 
        v-if="showModal" 
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      >
        <!-- 遮罩层 -->
        <div 
          class="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-md" 
          @click="closeCommentModal"
        />
        
        <!-- 模态框内容 -->
        <div 
          class="relative z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl m-4 max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="p-5">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-medium text-xl text-gray-800 dark:text-gray-200">写书评</h3>
              <button 
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="closeCommentModal"
              >
                <Icon name="ph:x" class="w-6 h-6" />
              </button>
            </div>

            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <label for="comment-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">标题</label>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ newComment.title.length }}/40</span>
              </div>
              <input 
                id="comment-title"
                v-model="newComment.title"
                type="text"
                maxlength="40"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                placeholder="请输入标题 (建议30字以内)"
              >
            </div>
            
            <!-- 评分 -->
            <div class="mb-4">
              <div class="flex items-center">
                <div class="flex space-x-1">
                  <button 
                    v-for="i in 5" 
                    :key="i" 
                    class="text-gray-300 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-500 transition-colors duration-200"
                    @click="newComment.rating = i"
                  >
                    <font-awesome-icon :icon="['fas', 'star']" :class="i <= newComment.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'" :style="{ width: '1rem',height: '1rem' }"/>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Markdown编辑器 -->
            <MdEditor
              v-model="newComment.content"
              class="mb-4"
              :style="{ height: '350px' }"
              previewTheme="default"
              :editorId="editorId"
              :toolbars="toolbars"
              @onUploadImg="onUploadImg"
              @onSave="submitComment"
            />
            
            <div class="flex justify-end">
              <button 
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors mr-3"
                @click="closeCommentModal"
              >
                取消
              </button>
              <button 
                class="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                :disabled="isSubmitting"
                @click="submitComment"
              >
                {{ isSubmitting ? '提交中...' : '提交评论' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { MdEditor, MdPreview, type ToolbarNames } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import type { PopularComment, PostCommentResponse } from '~/types/comment/long';
import { useUserStore } from '~/stores/user';
import { useToast } from 'vue-toastification';


const props = defineProps({
  novelId: {
    type: String,
    default: ''
  }
});

const userstore = useUserStore();
const toast = useToast();
const editorId = 'comment-editor';
const isSubmitting = ref(false);
const showModal = ref(false);
const comments = ref<PopularComment[]>([]);
const isLoading = ref(true);
const isExpanded = reactive<Record<string, boolean>>({});
const isDarkMode = ref(false);


// 获取热门评论
const fetchPopularComments = async () => {
  try {
    isLoading.value = true;
    const params: Record<string, string> = {};
    
    // 如果有小说ID，则获取该小说的热门评论
    if (props.novelId) {
      params.novelId = props.novelId;
    }
    
    const response = await useFetch<{ comments: PopularComment[] }>('/api/comments/popular', { 
      method: 'GET',
      params,
      headers: {
        'Authorization': `Bearer ${userstore.token}`
      }
    });
    
    if (response && response.data.value?.comments) {
      // 按创建时间倒序排序，最新的评论在最前面
      comments.value = response.data.value.comments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // 初始化所有评论为折叠状态
      comments.value.forEach(comment => {
        isExpanded[comment._id] = false;
      });
    }
  } catch (error) {
    console.error('获取热门评论失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 初始化时获取评论
onMounted(() => {
  fetchPopularComments();
  
  // Check if dark mode is enabled
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  // Listen for theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode.value = e.matches;
  });
});
// 打开评论模态框
const openCommentModal = () => {
  showModal.value = true;
  // 阻止背景滚动
  document.body.style.overflow = 'hidden';
};

// 关闭评论模态框
const closeCommentModal = () => {
  showModal.value = false;
  // 恢复背景滚动
  document.body.style.overflow = '';
};

// 编辑器配置
const toolbars: ToolbarNames[] = [
  'bold', 'italic', 'strikeThrough', 'title', 'sub', 'sup', 'quote', 'unorderedList',
  'orderedList', 'codeRow', 'code', 'link', 'image', 'table', 'revoke', 'next', 'save'
];

// 新评论数据
const newComment = ref({
  rating: 5,
  content: '',
  title: '',
  tags: [] as string[]
});

const stripMarkdown = (md: string) => {
  return md
    .replace(/#+\s+/g, '') // 移除标题
    .replace(/(?:\*\*|__)(.*?)\1/g, '$1') // 移除加粗
    .replace(/(?:\*|_)(.*?)\1/g, '$1') // 移除斜体
    .replace(/(?:~~)(.*?)~~/g, '$1') // 移除删除线
    .replace(/(?:`)(.*?)`/g, '$1') // 移除行内代码
    .replace(/(?:```)([\s\S]*?)```/g, '$1') // 移除代码块
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留链接文本
    .replace(/!\[(.*?)\]\(.*?\)/g, '[图片: $1]') // 替换图片为描述
    .replace(/^\s*>+\s+/gm, '') // 移除引用符号
    .replace(/^\s*[-+*]\s+/gm, '') // 移除无序列表符号
    .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表序号
    .replace(/^\s*[-*=_]{3,}\s*$/gm, '') // 移除水平线
    .replace(/\n{2,}/g, '\n'); // 将多个换行替换为单个换行
};

// 从Markdown内容中提取图片链接
const extractImageUrls = (markdown: string): string[] => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = markdown.match(regex);
  if (!matches) {
    return [];
  }
  return matches.map(match => {
    const urlMatch = /!\[.*?\]\((.*?)\)/.exec(match);
    return urlMatch ? urlMatch[1] : '';
  }).filter(url => url);
};

// 处理图片URL，将旧格式转换为新格式
const processImageUrl = (url: string): string => {
  // 如果已经是新格式的URL（以/api/开头），则直接返回
  if (url.startsWith('/api/')) {
    return url;
  }
  
  // 如果是旧格式的URL（以/storage/longcomment/开头），则转换为新格式
  if (url.startsWith('/storage/longcomment/')) {
    const filename = url.split('/').pop();
    if (filename) {
      return `/api/longcomment/images/${filename}`;
    }
  }
  
  // 默认返回原始URL
  return url;
};

// 替换Markdown中的图片URL
const processMarkdownImages = (markdown: string): string => {
  return markdown.replace(/!\[(.*?)\]\((\/storage\/longcomment\/.*?)\)/g, (match, alt, url) => {
    const newUrl = processImageUrl(url);
    return `![${alt}](${newUrl})`;
  });
};

// 上传图片
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  try {
    const res = await $fetch<string[]>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${userstore.token}`
      }
    });
    callback(res);
  } catch (error) {
    console.error('图片上传失败:', error);
    alert('图片上传失败，请稍后重试');
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
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
  } else if (diffDays < 30) {
    return `${diffDays}天前`;
  } else {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }
};

// 提交评论
const submitComment = async () => {
  if (!newComment.value.title.trim()) {
    toast.error('请填写标题');
    return;
  }

  if (stripMarkdown(newComment.value.content).trim().length < 50) {
    toast.error('评论内容不能少于50字');
    return;
  }

  try {
    isSubmitting.value = true;
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('content', newComment.value.content);
    formData.append('rating', newComment.value.rating.toString());
    formData.append('title', newComment.value.title);
    
    // 提取并添加图片链接
    const imageUrls = extractImageUrls(newComment.value.content);
    if (imageUrls.length > 0) {
      formData.append('images', JSON.stringify(imageUrls));
    }

    // 如果有标签，添加到表单
    if (newComment.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(newComment.value.tags));
    }
    
    // 如果有小说ID，添加到表单
    if (props.novelId) {
      formData.append('novelId', props.novelId);
    }
    
    // 提交到后端 - 使用专门的精华评论API
    await $fetch<PostCommentResponse>('/api/comments/popular/post', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${userstore.token}`
      }
    });
    
    // 重新获取热门评论，可能已经变化
    await fetchPopularComments();
    
    // 重置表单
    newComment.value.content = '';
    newComment.value.title = '';
    newComment.value.rating = 5;
    newComment.value.tags = [];
    
    // 关闭模态框
    closeCommentModal();
    
  } catch (error) {
    console.error('提交评论失败:', error);
    toast.error('提交评论失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style>
/* 添加Markdown内容的样式 */
.comment-content {
  font-size: 0.875rem;
  line-height: 1.5;
}

.comment-content img {
  max-width: 100%;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.comment-content a {
  color: #0ea5e9;
  text-decoration: none;
}

.comment-content a:hover {
  text-decoration: underline;
}

.comment-content pre {
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 0.5rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.dark .comment-content pre {
  background-color: #1f2937;
}

.comment-content blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0;
}

.dark .comment-content blockquote {
  border-left-color: #4b5563;
  color: #9ca3af;
}

.comment-content h1, .comment-content h2, .comment-content h3,
.comment-content h4, .comment-content h5, .comment-content h6 {
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.comment-content h1 { font-size: 1.5rem; }
.comment-content h2 { font-size: 1.25rem; }
.comment-content h3 { font-size: 1.125rem; }
.comment-content h4, .comment-content h5, .comment-content h6 { font-size: 1rem; }

.comment-content ul, .comment-content ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.comment-content ul { list-style-type: disc; }
.comment-content ol { list-style-type: decimal; }
</style>
  
  