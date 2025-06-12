<template>
  <div class="w-full mt-5">
    <h2 class="title-h2 mb-4">随笔小记 ({{ totalComments }})</h2>
    
    <CommentForm 
      ref="mainCommentForm"
      :is-submitting="isSubmittingComment"
      :include-rating="true"
      @submit="submitNewComment"
    />

    <div v-if="isLoading" class="text-center py-4">
      <p>加载评论中...</p>
    </div>
    <div v-else-if="errorLoadingComments" class="text-center py-4 text-red-500">
      <p>加载评论失败: {{ errorLoadingComments.message }}</p>
    </div>
    <div v-else-if="comments.length === 0" class="text-center py-4 text-gray-500">
      <p>暂无评论，快来抢沙发吧！</p>
    </div>
    <div v-else class="flex flex-col space-y-6 p-5">
      <CommentItem
        v-for="comment in comments"
        :key="comment._id"
        :comment="comment"
        :current-user-id="userStore.id" 
        @like-comment="handleLikeComment"
        @submit-reply="handlePostReply"
        @like-reply="handleLikeReply"
        @reply-added="handleReplyAdded"
      />
    </div>

    <div v-if="totalPages > 1" class="mt-6 flex justify-center space-x-2">
      <button 
        v-for="page in totalPages" 
        :key="page"
        :disabled="currentPage === page || isLoading"
        class="px-3 py-1 border rounded-md"
        :class="{
          'bg-primary-500 text-white': currentPage === page,
          'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600': currentPage !== page
        }"
        @click="fetchComments(page)"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Comment, Reply } from '~/types/comment/short'; // UserInfo not directly used here
import CommentItem from './CommentItem.vue';
import CommentForm from './CommentForm.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const props = defineProps<{
  novelId: string;
}>();

const comments = ref<Comment[]>([]);
const isLoading = ref(false);
const errorLoadingComments = ref<Error | null>(null);
const isSubmittingComment = ref(false);
const mainCommentForm = ref<InstanceType<typeof CommentForm> | null>(null);

const currentPage = ref(1);
const totalComments = ref(0);
const totalPages = ref(0);
const commentsPerPage = 10;

const fetchComments = async (page: number = 1) => {
  if (!props.novelId) return;
  isLoading.value = true;
  errorLoadingComments.value = null;
  try {
    const response = await $fetch<{ data: { comments: Comment[], total: number, totalPages: number, page: number } }>(`/api/comments/${props.novelId}`, {
      query: {
        page,
        limit: commentsPerPage
      },
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    });
    comments.value = response.data.comments;
    totalComments.value = response.data.total;
    totalPages.value = response.data.totalPages;
    currentPage.value = response.data.page;
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    errorLoadingComments.value = err instanceof Error ? err : new Error('Failed to load comments');
  } finally {
    isLoading.value = false;
  }
};

const submitNewComment = async (formData: { content: string; rating?: number; image?: File | null }) => {
  if (!props.novelId) return;
  isSubmittingComment.value = true;
  try {
    const body = new FormData();
    body.append('novelId', props.novelId);
    body.append('content', formData.content);
    if (formData.rating) {
      body.append('rating', formData.rating.toString());
    }
    if (formData.image) {
      body.append('image', formData.image);
    }

    // Type assertion for the response, assuming your backend returns this structure
    const response = await $fetch<{ data: { comment: Comment } }>('/api/comments/post', { 
      method: 'POST', 
      body: body, 
      headers: {
        'Authorization': `Bearer ${userStore.token}` 
      } 
    });

    if (response.data.comment) {
      comments.value.unshift(response.data.comment);
      totalComments.value++;
      mainCommentForm.value?.clearForm();
    }
  } catch (err) {
    console.error('Failed to post comment:', err);
    // Handle error display to user if needed
  } finally {
    isSubmittingComment.value = false;
  }
};

const handlePostReply = async (payload: { parentCommentId: string, content: string, replyToUserId?: string, callback: (newReply: Reply) => void }) => {
  isSubmittingComment.value = true;
  try {
    const response = await $fetch<{ data: { reply: Reply } }>(`/api/comments/${payload.parentCommentId}/reply`, {
      method: 'POST',
      body: { parentCommentId: payload.parentCommentId, content: payload.content, replyToUserId: payload.replyToUserId },
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    });
    if (response.data.reply) {
      payload.callback(response.data.reply);
    }

  } catch (err) {
    console.error('Failed to post reply:', err);
  } finally {
    isSubmittingComment.value = false;
  }
};

const handleLikeComment = async (commentId: Comment | string) => {
  const idToUse: string = typeof commentId === 'string' ? commentId : commentId._id;

  const response = await $fetch<{ data: { comment: Comment } }>(`/api/comments/${idToUse}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}` 
      }
  });

  const updatedComment = response.data.comment;
  const index = comments.value.findIndex(c => c._id === updatedComment._id);
  if (index !== -1) {
    comments.value.splice(index, 1, updatedComment);
  }
};

const handleLikeReply = async (reply: Reply, parentComment: Comment) => {
  console.log('Liking reply:', reply._id, 'to comment:', parentComment._id);
  try {
    const response = await $fetch<{ data: { reply: Reply } }>(`/api/reply/${reply._id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    });
    const updatedReply = response.data.reply;
    const commentIndex = comments.value.findIndex(c => c._id === parentComment._id);
    if (commentIndex !== -1) {
      const replyIndex = comments.value[commentIndex].replies.findIndex(r => r._id === updatedReply._id);
      if (replyIndex !== -1) {
        comments.value[commentIndex].replies[replyIndex] = updatedReply;
      }
    }

  } catch (error) {
     console.error("Failed to like reply:", error);
  }
};

const handleReplyAdded = (payload: { commentId: string, newReply: Reply }) => {
  const commentIndex = comments.value.findIndex(c => c._id === payload.commentId);
  if (commentIndex !== -1) {
    comments.value[commentIndex].replies.push(payload.newReply);
  }
};

onMounted(() => {
  fetchComments();
});

watch(() => props.novelId, (newNovelId) => {
  if (newNovelId) {
    comments.value = [];
    currentPage.value = 1;
    fetchComments();
  }
});

</script> 