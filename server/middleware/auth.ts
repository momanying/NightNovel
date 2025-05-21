import { UserModel } from '../models'
import { defineEventHandler, getRequestHeader, createError } from 'h3'
import jwt from 'jsonwebtoken'

// 定义公开路由列表
const PUBLIC_ROUTES: string[] = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/',                    // 主页
  '/login',              // 登录页
  '/register',           // 注册页
  '/api/novels',         // 小说列表
  '/api/novels/featured', // 推荐小说
  '/api/novels/latest',   // 最新小说
  '/api/novels/top',      // 热门小说
  '/api/tags/cloud',
  // '/api/user/avatar' // 已移除，需要认证
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'

export default defineEventHandler(async (event) => {
  const requestPath = event.path

  // 1. 检查是否是公开路由
  // 对于以 /api/novels/ 开头的路径，也视为公开 (更灵活的处理)
  const isPublicRoute = PUBLIC_ROUTES.includes(requestPath) || requestPath.startsWith('/api/novels/')
  
  if (isPublicRoute) {
    // console.log(`[Auth Middleware] Public route: ${requestPath}. Skipping token check.`)
    return // 公开路由，不进行认证
  }

  // 2. 对于非公开路由，尝试进行Token认证
  const authHeader = getRequestHeader(event, 'Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string } // 你的token payload 使用 'id'

      if (decoded && decoded.id) {
        const user = await UserModel.findById(decoded.id).select('-password')
        if (user) {
          event.context.auth = { user } // 设置 event.context.auth.user
          // console.log(`[Auth Middleware] User ${user.username} authenticated for ${requestPath}.`)
          return // 用户已认证，中间件处理完毕
        } else {
          console.warn(`[Auth Middleware] User not found for token ID: ${decoded.id} on path ${requestPath}.`)
          // 虽然token有效，但用户不存在，视为未授权
          throw createError({ statusCode: 401, statusMessage: 'User not found for provided token.' })
        }
      } else {
        // Token解码了，但没有id字段
         console.warn(`[Auth Middleware] Token decoded but no ID found for path ${requestPath}.`)
         throw createError({ statusCode: 401, statusMessage: 'Invalid token payload.' })
      }
    } catch (error: unknown) {
      // Token验证失败 (过期, 签名无效等)
      console.error(`[Auth Middleware] Invalid token for path ${requestPath}:`, error instanceof Error ? error.message : 'Unknown error')
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token.' })
    }
  }

  // 3. 如果没有有效的Auth Header或Bearer token (对于非公开路由)
  //    并且不是开发模式下的特定绕过 (如果需要保留开发模式绕过)
  
  // 开发模式下的用户模拟 (谨慎使用，并确保它不会干扰真实测试)
  // 最好只在 !event.context.auth?.user 的情况下执行，作为后备
  if (process.env.NODE_ENV === 'development' && !event.context.auth?.user) {
    console.warn(`[Auth Middleware] DEV MODE: No valid token for protected route ${requestPath}. Setting mock user.`)
    const mockUserId = 'dev-user-id-xxxxxxxx'
    event.context.auth = {
      user: {
        _id: mockUserId as string, // Mongoose ObjectId type might be different
        id: mockUserId,
        username: 'dev-user',
        email: 'dev@example.com',
        // avatar: '/path/to/dev/avatar.png' // 如果需要
      }
    }
    return // 开发模式下设置了模拟用户，则返回
  }

  // 4. 如果到这里，意味着是非公开路由，没有有效token，也不是开发模式下的模拟用户
  // console.log(`[Auth Middleware] No valid token or auth header for protected route: ${requestPath}.`)
  throw createError({
    statusCode: 401,
    statusMessage: 'Authorization token is missing or invalid.'
  })
})