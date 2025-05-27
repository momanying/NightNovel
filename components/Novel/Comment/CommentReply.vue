<template>
  <div class="flex mb-3">
    <img :src="reply.user.avatar" :alt="reply.user.username" class="w-6 h-6 rounded-lg mr-4">
    <div class="flex flex-col flex-grow">
      <div class="flex items-center justify-between w-full">
        <div>
          <span class="font-bold text-white dark:text-gray-200 text-sm">{{ reply.user.username }}</span>
          <span class="text-xs text-gray-400 ml-2">{{ new Date(reply.createdAt).toLocaleString() }}</span>
        </div>
        <CommentActions 
          :likes="reply.likes.length" 
          @like="emit('like-reply', reply)" 
          @reply="emit('reply-to-user', reply.user)"
        />
      </div>
      <div class="mt-2">
        <p class="text-white dark:text-gray-300 text-sm">
          <span v-if="reply.replyTo" class="text-blue-300">@{{ reply.replyTo.username }} </span>
          {{ reply.content }}
        </p>
      </div>
    </div>             
  </div>
</template>

<script setup lang="ts">
import type { Reply, UserInfo } from '~/types/comment';
import CommentActions from './CommentActions.vue';

const props = defineProps<{
  reply: Reply;
  currentUserId: string;
}>();

const emit = defineEmits<{ 
  (e: 'like-reply', reply: Reply): void;
  (e: 'reply-to-user', user: UserInfo): void;
}>();

console.log(props.reply);
</script> 