import type { Tag } from '~/types/tagscloud'
import type { ApiResponse } from '~/types/apiresponse'

/**
 * 获取标签云数据的组合式函数
 */
export function useTagCloud() {
  const tags = ref<Tag[]>([])
  const loading = ref(false) // 初始化为 false，因为是懒加载
  const error = ref<string | null>(null)
  const retryCount = ref(0)
  const maxRetries = 3
  
  // 获取标签云数据
  const fetchTagCloud = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, pending } = await useFetch<ApiResponse<Tag[]>>('/api/tags/cloud', {
        lazy: true, // 设置为懒加载
        server: false, // 确保只在客户端获取，因为是次要数据
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        key: `tagcloud-${Date.now()}` // 防止缓存
      })

      // 监听 pending 状态变化，因为是 lazy fetch
      watch(pending, (newPending) => {
        loading.value = newPending
      })
      
      if (data.value?.code === 200 && data.value.data) {
        tags.value = data.value.data
        retryCount.value = 0 // 成功后重置重试计数
      } else if (data.value) { // 确保 data.value 存在再访问 message
        error.value = data.value?.message || '获取标签云数据失败'
        await retryIfNeeded()
      } else if (!pending.value && !data.value) { // 如果请求结束但没有数据，也视为错误
        error.value = '获取标签云数据失败，响应为空'
        await retryIfNeeded()
      }
    } catch (err) {
      console.error('获取标签云数据失败:', err)
      error.value = '获取标签云数据失败，请稍后重试'
      await retryIfNeeded()
    } finally {
      // lazy: true 时，初始 loading.value 为 false，由 pending 状态驱动
      // loading.value = false // 移除此行，因为 pending 会处理
    }
  }
  
  // 如果失败，尝试重试
  const retryIfNeeded = async () => {
    if (retryCount.value < maxRetries) {
      retryCount.value++
      const delay = 1000 * retryCount.value // 递增延迟时间
      await new Promise(resolve => setTimeout(resolve, delay))
      await fetchTagCloud() // await 确保重试完成
    }
  }
  
  // 自动获取数据 (由于 lazy:true, 首次调用 fetchTagCloud 只是注册，实际获取会延迟)
  onMounted(() => {
    fetchTagCloud()
  })
  
  // 手动刷新
  const refresh = () => {
    retryCount.value = 0 // 手动刷新时重置重试计数
    fetchTagCloud()
  }
  
  return {
    tags,
    loading,
    error,
    refresh
  }
} 