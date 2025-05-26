<template>
  <form class="mt-4 mb-6" @submit.prevent="submitForm">
    <div class="relative">
      <textarea
        v-model="content"
        class="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
        rows="3"
        required
        :disabled="isSubmitting"
        :placeholder="placeholderText"
        @input="handleInput"
      />
      <div class="absolute bottom-2 right-2 flex space-x-2">
        <button
          type="button"
          title="表情"
          class="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150"
          @click="toggleEmojiPicker"
        >
          <font-awesome-icon :icon="['far', 'smile']" class="w-5 h-5" />
        </button>
        <button
          type="button"
          title="上传图片"
          class="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150"
          @click="triggerImageUpload"
        >
          <font-awesome-icon :icon="['far', 'image']" class="w-5 h-5" />
        </button>
        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageSelected"
        />
      </div>
    </div>

    <div v-if="showEmojiPicker" class="mt-2">
      <!-- Emoji picker will go here -->
      <div class="border p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          (Emoji picker will be integrated here)
        </p>
      </div>
    </div>

    <div v-if="imagePreviewUrl" class="mt-3">
      <div class="relative inline-block">
        <img :src="imagePreviewUrl" alt="Image preview" class="max-h-32 rounded-md border border-gray-300 dark:border-gray-600" />
        <button
          type="button"
          title="移除图片"
          class="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-500 text-white rounded-full text-xs"
          @click="removeImage"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
    </div>
    <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
      <span :class="{ 'text-red-500': contentLength > maxContentLength }">
        {{ contentLength }}
      </span>
      / {{ maxContentLength }}
    </div>

    <div v-if="includeRating" class="mt-2 flex items-center">
      <label class="mr-2 text-sm text-gray-700 dark:text-gray-300">评分:</label>
      <div class="flex space-x-1">
        <button 
          v-for="star in 5"
          :key="star"
          type="button"
          class="text-2xl transition-colors duration-150"
          :class="currentRating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500 hover:text-yellow-300'"
          :disabled="isSubmitting"
          @click="setRating(star)"        
        >
          <font-awesome-icon :icon="currentRating >= star ? ['fas', 'star'] : ['far', 'star']" />
        </button>
      </div>
    </div>
    <div class="mt-3 flex justify-end items-center">
      <span v-if="errorMessage" class="text-red-500 text-sm mr-4">{{ errorMessage }}</span>
      <button 
        type="submit"
        :disabled="isSubmitting || !content.trim() || contentLength > maxContentLength"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? '提交中...' : submitButtonText }}
      </button>
      <button 
        v-if="showCancelButton" 
        class="ml-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-md transition-colors duration-200"
        :disabled="isSubmitting"
        type="button" 
        @click="cancelForm"
      >
        取消
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
// import EmojiPicker from 'vue3-emoji-picker';
// import 'vue3-emoji-picker/css';

const props = defineProps<{
  initialContent?: string;
  initialRating?: number;
  placeholder?: string;
  submitText?: string;
  includeRating?: boolean;
  isSubmitting?: boolean;
  showCancelButton?: boolean;
  maxContentLength?: number;
}>();

const emit = defineEmits(['submit', 'cancel', 'content-change']);

const content = ref(props.initialContent || '');
const currentRating = ref(props.initialRating || 0);
const errorMessage = ref('');
const showEmojiPicker = ref(false);
const imageInputRef = ref<HTMLInputElement | null>(null);
const selectedImageFile = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);

const contentLength = computed(() => content.value.length);
const maxContentLength = computed(() => props.maxContentLength || 500);

const placeholderText = computed(() => props.placeholder || '写下你的评论...');
const submitButtonText = computed(() => props.submitText || '发表评论');

const setRating = (rating: number) => {
  currentRating.value = rating;
};

const handleInput = () => {
  if (contentLength.value > maxContentLength.value) {
    // Optionally, trim the content or show a persistent error
    // For now, we just let the visual indicator and disabled submit button handle it
  }
  emit('content-change', content.value);
};

watch(() => props.initialContent, (newVal) => {
  content.value = newVal || '';
});

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// const onSelectEmoji = (emoji: any) => {
//   // console.log(emoji);
//   // Append emoji to content - need to handle cursor position
//   const textarea = document.querySelector('textarea'); // This is a bit fragile, consider using a ref
//   if (textarea) {
//     const start = textarea.selectionStart;
//     const end = textarea.selectionEnd;
//     content.value = content.value.substring(0, start) + emoji.i + content.value.substring(end);
//     // Move cursor after inserted emoji
//     textarea.selectionStart = textarea.selectionEnd = start + emoji.i.length;
//   }
//   // showEmojiPicker.value = false; // Optionally close picker after selection
// };

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const handleImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    // Basic validation (e.g., file type, size)
    if (!file.type.startsWith('image/')) {
      errorMessage.value = '请选择图片文件';
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      errorMessage.value = '图片大小不能超过 2MB';
      return;
    }
    selectedImageFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
    errorMessage.value = '';
  }
};

const removeImage = () => {
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  if (imageInputRef.value) {
    imageInputRef.value.value = ''; // Reset file input
  }
};

const submitForm = () => {
  if (!content.value.trim() && !selectedImageFile.value) {
    errorMessage.value = '内容或图片不能为空';
    return;
  }
  if (contentLength.value > maxContentLength.value) {
    errorMessage.value = `内容不能超过 ${maxContentLength.value} 个字符`;
    return;
  }
  errorMessage.value = '';
  const submissionData: { content: string; rating?: number; image?: File | null } = { 
    content: content.value,
    image: selectedImageFile.value,
  };
  if (props.includeRating) {
    submissionData.rating = currentRating.value > 0 ? currentRating.value : undefined;
  }
  emit('submit', submissionData);
};

const cancelForm = () => {
  emit('cancel');
  content.value = props.initialContent || '';
  currentRating.value = props.initialRating || 0;
  errorMessage.value = '';
  removeImage();
  showEmojiPicker.value = false;
};

// Expose a method to clear the form, e.g., after successful submission
const clearForm = () => {
  content.value = '';
  currentRating.value = 0;
  errorMessage.value = '';
  removeImage();
  showEmojiPicker.value = false;
};

defineExpose({ clearForm });

</script> 