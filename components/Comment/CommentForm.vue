<template>
  <form class="mt-4 mb-6 p-5" @submit.prevent="submitForm">
    <textarea
      ref="textareaRef"
      v-model="content"
      class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
      rows="3"
      required
      :disabled="isSubmitting"
      :placeholder="placeholderText"
      @input="handleInput"
    />

    <div class="mt-2 flex justify-between">
      <div class="flex items-center space-x-3">
        <!-- Emoji Picker Button and Dropdown -->
        <div class="relative">
          <button
            type="button"
            title="表情"
            class="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150"
            @click="toggleEmojiPicker"
          >
            <font-awesome-icon :icon="['far', 'face-smile']" class="w-5 h-5 inline-block"/>
          </button>
          <div
            v-if="showEmojiPicker"
            class="absolute z-20 p-0 rounded-md shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <EmojiPicker
              :display-recent="true"
              class="w-full"
              :native="true"
              theme="dark"
              @select="onSelectEmoji"
            />
          </div>
        </div>

        <!-- Image Upload Button -->
        <button
          type="button"
          title="上传图片"
          class="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-150"
          @click="triggerImageUpload"
        >
          <font-awesome-icon :icon="['far', 'image']" class="w-5 h-5 inline-block"/>
        </button>
        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageSelected"
        >
      </div>

    </div>

    <div v-if="imagePreviewUrl" class="mt-3">
      <div class="relative inline-block">
        <img :src="imagePreviewUrl" alt="Image preview" class="max-h-32 rounded-md border border-gray-300 dark:border-gray-600">
        <button
          type="button"
          title="移除图片"
          class="absolute top-0 right-0 -mt-2 -mr-2 p-1 bg-red-500 text-white rounded-full text-xs"
          @click="removeImage"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" :style="{ width: '0.8rem', height: '0.8rem' }" />
        </button>
      </div>
    </div>

    <div class="mt-3 flex justify-end items-center">
      <span v-if="errorMessage" class="text-red-500 text-sm mr-4">{{ errorMessage }}</span>
      <button 
        type="submit"
        :disabled="isSubmitting || !content.trim() || contentLength > maxContentLength"
        class="px-4 py-2 bg-sky-500 hover:bg-primary-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed, watch, nextTick } from 'vue';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';


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

const textareaRef = ref<HTMLTextAreaElement | null>(null);
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

interface EmojiExtracted {
  i: string;
  n: string[];
  r: string;
  t: string;
  u: string;
}

function onSelectEmoji(emoji: EmojiExtracted) {
  if (textareaRef.value) {
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const currentContent = content.value;
    content.value = currentContent.substring(0, start) + emoji.i + currentContent.substring(end);
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.selectionStart = textareaRef.value.selectionEnd = start + emoji.i.length;
        textareaRef.value.focus();
      }
    });
  }
}

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

const handleInput = () => {
  emit('content-change', content.value);
};

watch(() => props.initialContent, (newVal) => {
  content.value = newVal || '';
});

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const removeImage = () => {
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  if (imageInputRef.value) {
    imageInputRef.value.value = '';
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

const clearForm = () => {
  content.value = '';
  currentRating.value = 0;
  errorMessage.value = '';
  removeImage();
  showEmojiPicker.value = false;
};

defineExpose({ clearForm });

</script> 