import { defineStore } from 'pinia'
import type { Novel } from '~/types/novel/novelinfo'
import type { Volume } from '~/types/novel/volume'
import type { ChapterDetail } from '~/types/novel/chapter'
import type { ApiResponse } from '~/types/auth'

export const useNovelStore = defineStore('novel', () => {
  // 状态
  const currentNovel = ref<Novel | null>(null)
  const currentNovelId = ref<string | null>(null)
  const novelVolumes = ref<Volume[]>([])
  const loadingNovel = ref(false)
  const novelError = ref<string | null>(null)
  const lastFetchTime = ref<number | null>(null)
  
  // 章节相关状态
  const currentChapter = ref<ChapterDetail | null>(null)
  const prevChapter = ref<{ id: string; title: string; order: number } | null>(null)
  const nextChapter = ref<{ id: string; title: string; order: number } | null>(null)
  const loadingChapter = ref(false)
  const chapterError = ref<string | null>(null)
  
  // 缓存时间（毫秒）- 默认5分钟
  const CACHE_DURATION = 5 * 60 * 1000
  
  // 检查缓存是否有效
  const isCacheValid = computed(() => {
    if (!lastFetchTime.value || !currentNovelId.value) return false
    const now = Date.now()
    return (now - lastFetchTime.value) < CACHE_DURATION
  })
  
  // 获取完整小说数据
  async function fetchNovelData(novelId: string, forceRefresh = false) {
    if (!novelId) return
    
    // 如果已经加载了相同小说且缓存有效，直接返回
    if (!forceRefresh && currentNovelId.value === novelId && isCacheValid.value) {
      return { novel: currentNovel.value, volumes: novelVolumes.value }
    }
    
    loadingNovel.value = true
    novelError.value = null
    
    try {
      // 获取小说基本信息和章节
      const { data } = await useFetch<ApiResponse<{
        novel: Novel;
        volumes: Volume[];
      }>>(`/api/novels/${novelId}`)
      
      if (data.value?.code === 200 && data.value.data) {
        currentNovelId.value = novelId
        currentNovel.value = data.value.data.novel
        novelVolumes.value = data.value.data.volumes || []
        lastFetchTime.value = Date.now()
        
        return { 
          novel: currentNovel.value, 
          volumes: novelVolumes.value 
        }
      } else {
        novelError.value = data.value?.message || '获取小说数据失败'
        return null
      }
    } catch (err) {
      console.error('获取小说数据失败:', err)
      novelError.value = '获取小说数据失败，请稍后重试'
      return null
    } finally {
      loadingNovel.value = false
    }
  }
  
  // 获取章节内容
  async function fetchChapterContent(novelId: string, chapterId: string) {
    if (!novelId || !chapterId) return null
    
    loadingChapter.value = true
    chapterError.value = null
    
    try {
      // 确保小说基本信息已加载
      if (!currentNovel.value || currentNovelId.value !== novelId) {
        await fetchNovelData(novelId)
      }
      
      // 获取章节内容
      const { data: response } = await useFetch<ApiResponse<{
        chapter: ChapterDetail;
        prevChapter: { id: string; title: string; order: number } | null;
        nextChapter: { id: string; title: string; order: number } | null;
      }>>(`/api/novels/${novelId}/${chapterId}`)
      
      if (response.value?.code === 200 && response.value.data) {
        currentChapter.value = response.value.data.chapter
        prevChapter.value = response.value.data.prevChapter
        nextChapter.value = response.value.data.nextChapter
        
        return {
          chapter: currentChapter.value,
          prevChapter: prevChapter.value,
          nextChapter: nextChapter.value
        }
      } else {
        chapterError.value = response.value?.message || '获取章节内容失败'
        return null
      }
    } catch (err) {
      console.error('获取章节内容失败:', err)
      chapterError.value = '获取章节内容失败，请稍后重试'
      return null
    } finally {
      loadingChapter.value = false
    }
  }
  
  // 清除当前小说数据
  function clearNovelData() {
    currentNovel.value = null
    currentNovelId.value = null
    novelVolumes.value = []
    lastFetchTime.value = null
    currentChapter.value = null
    prevChapter.value = null
    nextChapter.value = null
  }
  
  // 刷新小说数据
  async function refreshNovelData() {
    if (currentNovelId.value) {
      return await fetchNovelData(currentNovelId.value, true)
    }
    return null
  }
  
  return {
    // 小说状态
    currentNovel,
    currentNovelId,
    novelVolumes,
    loadingNovel,
    novelError,
    
    // 章节状态
    currentChapter,
    prevChapter,
    nextChapter,
    loadingChapter,
    chapterError,
    
    // 计算属性
    isCacheValid,
    
    // 方法
    fetchNovelData,
    fetchChapterContent,
    clearNovelData,
    refreshNovelData
  }
}) 