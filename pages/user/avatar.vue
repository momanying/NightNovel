<template>
  <div>
    <div class="w-full space-y-6 p-2">
      <div class="bg-gray-700/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-100 dark:text-white mb-5 border-b border-gray-600 dark:border-gray-700 pb-3">
          头像上传
        </h2>
        
        <div class="flex flex-col items-center md:flex-row md:items-start gap-6">
          <!-- Current Avatar & Preview -->
          <div class="flex flex-col items-center space-y-4 shrink-0">
            <p class="text-sm text-gray-400">当前头像:</p>
            <img 
              :src="userStore.avatar || '/images/default-cover.jpg'" 
              alt="当前头像" 
              class="w-32 h-32 rounded-full object-cover border-2 border-gray-600 shadow-md"
            >
            <div v-if="previewUrl" class="mt-4 items-center flex flex-col">
              <p class="text-sm text-gray-400">新头像预览:</p>
              <img 
                :src="previewUrl" 
                alt="新头像预览" 
                class="w-32 h-32 rounded-full object-cover border-2 border-primary-500 shadow-md"
              >
            </div>
          </div>

          <!-- Upload Controls -->
          <div class="flex-1 flex flex-col items-center md:items-start space-y-4">
            <input 
              ref="avatarInputRef"
              type="file"  
              accept="image/png, image/jpeg, image/gif, image/webp" 
              class="hidden"
              @change="handleAvatarSelected"  
            >
            <div>
              <!-- Hand-coded "选择图片" button -->
              <button
                type="button"
                :disabled="isUploading"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-700 hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="avatarInputRef?.click()"
              >
                选择图片
              </button>
              <p class="text-sm text-gray-400 mt-1">支持的文件类型: JPG, PNG, GIF, WEBP</p>
            </div>
            
            <div v-if="selectedAvatarFile" class="text-sm text-gray-300">
              已选择: {{ selectedAvatarFile.name }} ({{ (selectedAvatarFile.size / 1024).toFixed(1) }} KB)
            </div>

            <div v-if="selectedAvatarFile">
              <!-- Hand-coded "上传头像" button -->
              <button
                type="button"
                :disabled="isUploading"
                class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-pink-500 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="uploadAvatar"
              >
                <!-- Loading spinner (simple text or a Font Awesome spinner) -->
                <template v-if="isUploading">
                  上传中...
                </template>
                <template v-else>
                  上传头像
                </template>
              </button>
            </div>
            <p v-if="isUploading && !selectedAvatarFile" class="text-sm text-primary-400">正在上传...</p>
          </div>
        </div>
      </div>
    </div>
    
    <CommonAvatarCropper 
      v-if="showCropper && imageToEditUrl" 
      :image-src="imageToEditUrl" 
      @crop="onCropDone" 
      @cancel="showCropper = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification';
import { useUserStore } from '~/stores/user';
import 'vue-advanced-cropper/dist/style.css'
import 'vue-advanced-cropper/dist/theme.compact.css'

const toast = useToast();
const userStore = useUserStore();

const avatarInputRef = ref<HTMLInputElement | null>(null);
const selectedAvatarFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isUploading = ref(false);

const showCropper = ref(false);
const imageToEditUrl = ref<string | null>(null);

async function handleAvatarSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('无效的文件类型. 请选择图片 (JPG, PNG, GIF, WEBP).');
      target.value = ''; 
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      toast.error(`文件过大. 最大限制 ${MAX_SIZE / (1024 * 1024)}MB.`);
      target.value = ''; 
      return;
    }
    
    imageToEditUrl.value = URL.createObjectURL(file);
    showCropper.value = true;
  } 
}

function onCropDone(croppedBlob: Blob) {
  if (avatarInputRef.value?.files?.[0]) {
    const originalFile = avatarInputRef.value.files[0];
    const fileName = originalFile.name;
    selectedAvatarFile.value = new File([croppedBlob], fileName, {
      type: croppedBlob.type,
      lastModified: new Date().getTime()
    });
  } else {
    selectedAvatarFile.value = new File([croppedBlob], "cropped-avatar.webp", {
      type: croppedBlob.type,
      lastModified: new Date().getTime()
    });
  }
  
  previewUrl.value = URL.createObjectURL(croppedBlob);
  
  showCropper.value = false;
  imageToEditUrl.value = null;
}

async function uploadAvatar() {
  if (!selectedAvatarFile.value) {
    toast.error('请先选择一个头像文件.');
    return;
  }

  if (!userStore.token) {
    toast.error('用户未登录或会话已过期，请重新登录。');
    return;
  }

  isUploading.value = true;
  const formData = new FormData();
  formData.append('avatar', selectedAvatarFile.value);
  let toastIdVar: string | number | undefined;

  try {
    const response = await $fetch<{ success: boolean; message: string; avatarUrl: string }>('/api/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${userStore.token}` 
      }
    });

    if (toastIdVar) toast.dismiss(toastIdVar);

    if (response.success) {
      toast.success(response.message || '头像上传成功!');
      userStore.avatar = response.avatarUrl; 
      selectedAvatarFile.value = null; 
      previewUrl.value = null; 
      if(avatarInputRef.value) avatarInputRef.value.value = '';
    } else {
      toast.error(response.message || '无法更新头像.');
    }
  } catch (error: unknown) { 
    if (toastIdVar) toast.dismiss(toastIdVar); 
    console.error('Avatar upload error:', error);
    const errorMessage = error instanceof Error ? error.message : '上传头像时发生未知错误.';
    toast.error(`上传失败: ${errorMessage}`);
  } finally {
    isUploading.value = false;
  }
}
</script>