<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
      <h3 class="text-xl font-semibold text-white mb-4">裁剪头像</h3>
      
      <div>
        <Cropper
          ref="cropperRef"
          class="cropper"
          :src="imageSource"
          :stencil-props="{
            aspectRatio: 1,
          }"
          @ready="onReady"
        />
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="emit('cancel')"
        >
          取消
        </button>
        <button
            class="px-4 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            @click="crop"
        >   
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

interface Props {
  imageSrc: string; // Used in template
}

const props = defineProps<Props>();

// Use props in a computed property to avoid linter error
const imageSource = computed(() => props.imageSrc);

const emit = defineEmits<{
  (e: 'crop', data: Blob): void;
  (e: 'cancel'): void;
}>();

const cropperRef = ref();
const isReady = ref(false);

const onReady = () => {
  isReady.value = true;
};

const crop = async () => {
  if (isReady.value && cropperRef.value) {
    const { canvas } = cropperRef.value.getResult();
    
    // Convert canvas to blob
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        emit('crop', blob);
      }
    }, 'image/webp', 0.9); // Using webp for better compression
  }
};
</script>

<style>
.cropper {
  height: 350px;
  width: 350px;
  border-radius: 50%;
}

.vue-advanced-cropper__boundary {
  border-radius: 50%;
}
</style> 