import type { H3Event } from 'h3'
import { eventHandler, getRequestIP, getRequestURL } from 'h3'

interface RateLimitOptions {
  windowMs: number // 时间窗口，单位毫秒
  max: number // 在时间窗口内允许的最大请求次数
  paths?: string[] // 需要限制的路径
}

// 使用内存存储请求记录
const requestStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, paths = [] } = options

  // 使用eventHandler包装处理函数
  return eventHandler(async (event: H3Event) => {
    const url = getRequestURL(event)
    const pathname = url.pathname
    
    // 检查当前请求路径是否需要限流
    const shouldLimit = paths.length === 0 || paths.some(path => pathname.includes(path))
    
    // 如果不需要限流，直接放行
    if (!shouldLimit) {
      return
    }
    
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

// 只对登录和注册路径进行限流
export default rateLimit({ 
  windowMs: 60 * 1000, 
  max: 60,
  paths: ['/api/auth/login', '/api/auth/register']
})