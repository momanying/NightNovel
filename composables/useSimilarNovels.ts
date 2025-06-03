import type { Novel } from '~/types/novel/novelinfo';
import { ref } from 'vue';

// Create a reactive object to store novel data without relying on useState directly
const similarNovelsCache = new Map<string, Novel[]>();
const similarFinishNovelsCache = new Map<string, Novel[]>();

export const useSimilarNovels = (novelId: string) => {
  // Create a ref to store the novels
  const novels = ref<Novel[]>([]);
  
  // Load from cache if exists
  if (similarNovelsCache.has(novelId)) {
    novels.value = similarNovelsCache.get(novelId) || [];
  }
  
  // Return a simple API with ref and methods
  return {
    novels,
    set(data: Novel[]) {
      novels.value = data;
      similarNovelsCache.set(novelId, data);
    },
    clear() {
      novels.value = [];
      similarNovelsCache.set(novelId, []);
    }
  };
}

export const useSimilarFinishNovels = (novelId: string) => {
  // Create a ref to store the novels
  const novels = ref<Novel[]>([]);
  
  // Load from cache if exists
  if (similarFinishNovelsCache.has(novelId)) {
    novels.value = similarFinishNovelsCache.get(novelId) || [];
  }
  
  // Return a simple API with ref and methods
  return {
    novels,
    set(data: Novel[]) {
      novels.value = data;
      similarFinishNovelsCache.set(novelId, data);
    },
    clear() {
      novels.value = [];
      similarFinishNovelsCache.set(novelId, []);
    }
  };
}
