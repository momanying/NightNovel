<template>
  <div class="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div class="flex mb-2">
      <img :src="comment.user?.avatar || ''" :alt="comment.user?.username || 'User'" class="w-10 h-10 rounded-lg mr-4">
      <div class="flex flex-col flex-grow mt-2 w-full">
        <div class="flex items-center justify-between w-full">
          <div>
            <span class="font-bold text-white dark:text-gray-200 text-sm">{{ comment.user?.username || 'Anonymous' }}</span>
            <span class="text-xs text-gray-400 ml-2">{{ new Date(comment.createdAt).toLocaleString() }}</span>
          </div>
          <CommentActions 
            :likes="comment.likes.length"
            :is-liked="comment.likes.some(like => like.toString() === currentUserId)"
            @like="emit('like-comment', comment)" 
            @reply="toggleReplyForm(comment.user)" 
          />
        </div>
        <p class="text-white dark:text-gray-300 text-sm mt-3">{{ comment.content }}</p>
        <img v-if="comment.image" :src="comment.image" alt="Comment Image" class="w-24 h-24 rounded-lg mt-3">
        <div v-if="showReplyForm && !replyingToUser" class="mt-3">
          <ReplyForm 
            ref="replyFormRef"
            :placeholder="`回复 @${comment.user?.username || 'Anonymous'}...`" 
            submit-text="发表回复"
            :is-submitting="isSubmittingReply"
            :show-cancel-button="true"
            @submit="submitReply"
            @cancel="cancelReplyForm"
          />
        </div>

        <div v-if="comment.replies && comment.replies.length > 0" class="mt-5 space-y-3">
          <CommentReply
            v-for="reply in comment.replies" 
            :key="reply._id"
            :reply="reply"
            :current-user-id="currentUserId"
            @like-reply="emit('like-reply', reply, comment)"
            @reply-to-user="replyToSpecificUser"
          />
        </div>
        
         <div v-if="showReplyForm && replyingToUser" class="mt-3 ml-8">
          <ReplyForm 
            ref="specificReplyFormRef"
            :placeholder="`回复 @${replyingToUser?.username || 'Anonymous'}...`" 
            submit-text="发表回复"
            :is-submitting="isSubmittingReply"
            :show-cancel-button="true"
            @submit="content => submitReply(content, replyingToUser?._id)"
            @cancel="cancelReplyForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Comment, Reply, UserInfo } from '~/types/comment/short';
import CommentActions from './CommentActions.vue';
import CommentReply from './CommentReply.vue';
import ReplyForm from './ReplyForm.vue';

const props = defineProps<{
  comment: Comment;
  currentUserId: string; 
}>();

const emit = defineEmits(['like-comment', 'submit-reply', 'like-reply', 'reply-added']);

const showReplyForm = ref(false);
const isSubmittingReply = ref(false);
const replyingToUser = ref<UserInfo | null>(null);
const replyFormRef = ref<InstanceType<typeof ReplyForm> | null>(null);
const specificReplyFormRef = ref<InstanceType<typeof ReplyForm> | null>(null);

const toggleReplyForm = (userToReplyTo: UserInfo | null) => {
  if (showReplyForm.value && replyingToUser.value?.username === userToReplyTo?.username) {
      showReplyForm.value = false;
      replyingToUser.value = null;
  } else {
      showReplyForm.value = true;
      replyingToUser.value = userToReplyTo;
  }
};

const replyToSpecificUser = (user: UserInfo) => {
  toggleReplyForm(user);
};

const cancelReplyForm = () => {
  showReplyForm.value = false;
  replyingToUser.value = null;
  replyFormRef.value?.clearForm();
  specificReplyFormRef.value?.clearForm();
};

const submitReply = async (content: string, replyToUserId?: string) => {
  if (!content.trim()) return;
  isSubmittingReply.value = true;
  try {
    emit('submit-reply', { 
      parentCommentId: props.comment._id, 
      content, 
      replyToUserId, 
      callback: (newReply: Reply) => {
        emit('reply-added', { commentId: props.comment._id, newReply }); 
        cancelReplyForm();
      }
    });
  } catch (error) {
    console.error("Failed to submit reply through CommentItem:", error);
  } finally {
    isSubmittingReply.value = false;
  }
};
</script> 