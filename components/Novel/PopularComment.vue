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
    
    <div class="flex flex-col mt-2 border-4 rounded-lg">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"/>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="comments.length === 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center my-4">
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
      <div
        v-for="comment in comments" 
        v-else 
        :key="comment._id" 
        class="bg-gray-50 dark:bg-gray-800 p-4 shadow-sm border-b border-dashed border-gray-700"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <img :src="comment.user.avatar" :alt="comment.user.username" class="w-8 h-8 rounded-full mr-2">
            <span class="font-medium text-gray-800 dark:text-gray-200 text-sm truncate max-w-[80px]">{{ comment.user.username }}</span>
          </div>
          <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
        </div>
        
        <!-- 渲染 Markdown 内容 -->
        <div v-if="isExpanded[comment._id]" class="comment-content">
          <MdPreview modelValue={comment.content} previewTheme="default" />
        </div>
        
        <!-- 折叠预览 -->
        <div v-else class="line-clamp-3 text-gray-700 dark:text-gray-300 text-xs overflow-hidden mb-2">
          {{ stripMarkdown(comment.content) }}
        </div>
        
      </div>
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
              <div class="flex items-center mb-2">
                <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">标题:</span>
                <input 
                  v-model="newComment.title"
                  class="w-1/2 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500  placeholder-gray-400 text-black"
                  placeholder="请输入标题"
                >
              </div>
            </div>
            
            <!-- 评分 -->
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <span class="text-sm text-gray-700 dark:text-gray-300 mr-2">评分:</span>
                <div class="flex">
                  <button 
                    v-for="i in 5" 
                    :key="i" 
                    class="text-yellow-400 focus:outline-none"
                    @click="newComment.rating = i"
                  >
                    <Icon :name="i <= newComment.rating ? 'ph:star-fill' : 'ph:star'" class="w-5 h-5" />
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
import type { Comment } from '~/types/comment';

const props = defineProps({
  novelId: {
    type: String,
    default: ''
  }
});

const editorId = 'comment-editor';
const isSubmitting = ref(false);
const showModal = ref(false);
const comments = ref<Comment[]>([]);
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
    
    const response = await $fetch<{ comments: Comment[] }>('/api/comments/popular', { 
      method: 'GET',
      params
    });
    
    if (response && response.comments) {
      comments.value = response.comments;
      
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

// 移除Markdown语法以获得纯文本预览
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
  if (!newComment.value.content.trim()) {
    alert('请输入评论内容');
    return;
  }
  
  try {
    isSubmitting.value = true;
    
    // 创建表单数据
    const formData = new FormData();
    formData.append('content', newComment.value.content);
    formData.append('rating', newComment.value.rating.toString());
    
    // 如果有标签，添加到表单
    if (newComment.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(newComment.value.tags));
    }
    
    // 如果有小说ID，添加到表单
    if (props.novelId) {
      formData.append('novelId', props.novelId);
    }
    
    // 提交到后端 - 使用专门的精华评论API
    await fetch('/api/comments/popular/post', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('评论提交成功');
    
    // 重新获取热门评论，可能已经变化
    await fetchPopularComments();
    
    // 重置表单
    newComment.value.content = '';
    newComment.value.rating = 5;
    newComment.value.tags = [];
    
    // 关闭模态框
    closeCommentModal();
    
  } catch (error) {
    console.error('提交评论失败:', error);
    alert('提交评论失败，请稍后重试');
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
  
  