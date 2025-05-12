import type { Novel } from '~/types/novel/novelinfo'
import type { ApiResponse } from '~/types/auth'

/**
 * 随机小说推荐功能
 * 从数据库中随机抽取一本小说
 */
export function useRandomNovel() {
  const isLoading = ref(false)
  const randomNovel = ref<Novel | null>(null)
  const error = ref<Error | null>(null)

  // 从缓存获取数据的键名
  const TOP_NOVELS_CACHE_KEY = 'top-novels-30'
  const LATEST_NOVELS_CACHE_KEY = 'latest-novels-30'

  /**
   * 获取随机推荐小说
   */
  const getRandomNovel = async (): Promise<Novel | null> => {
    isLoading.value = true
    error.value = null
    
    try {
      // 首先检查缓存中是否已有数据
      const nuxtApp = useNuxtApp()
      let novels: Novel[] = []
      
      // 尝试从useFetch缓存获取数据
      const cachedData = nuxtApp.payload.data[TOP_NOVELS_CACHE_KEY]
      if (cachedData && 'data' in cachedData && Array.isArray(cachedData.data)) {
        novels = cachedData.data
      } else {
        // 如果没有缓存数据，再进行API调用
        const { data: topResponse } = await useFetch<ApiResponse<Novel[]>>('/api/novels/top', {
          method: 'GET',
          query: { limit: 30 },
          key: TOP_NOVELS_CACHE_KEY,
          transform: (response) => response
        })
        
        if (topResponse.value && 'data' in topResponse.value) {
          novels = topResponse.value.data as Novel[]
        }
      }
      
      // 有数据则返回随机一个
      if (novels.length > 0) {
        const randomIndex = Math.floor(Math.random() * novels.length)
        const novel = novels[randomIndex]
        randomNovel.value = novel
        return novel
      }
      
      // 尝试获取最新小说
      const latestCached = nuxtApp.payload.data[LATEST_NOVELS_CACHE_KEY]
      if (latestCached && 'data' in latestCached && Array.isArray(latestCached.data)) {
        novels = latestCached.data
      } else {
        const { data: latestResponse } = await useFetch<ApiResponse<Novel[]>>('/api/novels/latest', {
          method: 'GET',
          query: { limit: 30 },
          key: LATEST_NOVELS_CACHE_KEY,
          transform: (response) => response
        })
        
        if (latestResponse.value && 'data' in latestResponse.value) {
          novels = latestResponse.value.data as Novel[]
        }
      }
      
      if (novels.length > 0) {
        const randomIndex = Math.floor(Math.random() * novels.length)
        const novel = novels[randomIndex]
        randomNovel.value = novel
        return novel
      }
      
      return null
    } catch (error) {
      console.error('获取随机小说失败:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    randomNovel,
    isLoading,
    error,
    getRandomNovel
  }
} 