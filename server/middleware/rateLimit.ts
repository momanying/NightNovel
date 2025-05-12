import type { H3Event } from 'h3'
import { eventHandler, getRequestIP } from 'h3'

interface RateLimitOptions {
  windowMs: number // 时间窗口，单位毫秒
  max: number // 在时间窗口内允许的最大请求次数
}

// 使用内存存储请求记录
const requestStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max } = options

  // 使用eventHandler包装处理函数
  return eventHandler(async (event: H3Event) => {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    const record = requestStore.get(ip)

    if (!record) {
      // 首次请求
      requestStore.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
    } else {
      if (now > record.resetTime) {
        // 重置计数
        record.count = 1
        record.resetTime = now + windowMs
      } else if (record.count >= max) {
        // 超出限制
        return {
          code: 429,
          message: '请求过于频繁，请稍后再试',
          data: null
        }
      } else {
        // 增加计数
        record.count++
      }
    }

    // 清理过期记录
    if (now % (windowMs * 2) === 0) {
      for (const [key, value] of requestStore.entries()) {
        if (now > value.resetTime) {
          requestStore.delete(key)
        }
      }
    }
  })
} 

export default rateLimit({ windowMs: 60 * 1000, max: 60 })