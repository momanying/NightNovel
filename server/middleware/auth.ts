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
  '/api/tags/cloud',
  '/api/comments', // Base comments route
  '/api/comments/popular', // For GETting popular comments
  '/api/comments/popular/post', // For POSTing popular comments
  // '/api/user/password',
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'

export default defineEventHandler(async (event) => {
  const requestPath = event.path;
  console.log(`[Auth Middleware] Request path: ${requestPath}`); // DEBUG LINE

  // Explicit check for the problematic route
  if (requestPath === '/api/comments/popular/post') {
    console.log('[Auth Middleware] Allowing /api/comments/popular/post as public (debug check).');
    return; // Explicitly allow for debugging
  }

  // Check if the request path or its base (for dynamic routes) is in PUBLIC_ROUTES
  const isPublicRoute = PUBLIC_ROUTES.some(publicRoute => {
    if (requestPath.startsWith('/api/novels/') && publicRoute === '/api/novels/') {
      return true; // Specific handling for /api/novels/*
    }
    return requestPath === publicRoute;
  });
  
  if (isPublicRoute) {
    console.log(`[Auth Middleware] Path ${requestPath} is public.`); // DEBUG LINE
    return // 公开路由，不进行认证
  }
  
  console.log(`[Auth Middleware] Path ${requestPath} is NOT public. Proceeding with auth check.`); // DEBUG LINE

  const authHeader = getRequestHeader(event, 'Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string } // 你的token payload 使用 'id'

      if (decoded && decoded.id) {
        const user = await UserModel.findById(decoded.id).select('-password')
        if (user) {
          event.context.auth = { user } // 设置 event.context.auth.user
          return // 用户已认证，中间件处理完毕
        } else {
          console.warn(`[Auth Middleware] User not found for token ID: ${decoded.id} on path ${requestPath}.`)
          throw createError({ statusCode: 401, statusMessage: 'User not found for provided token.' })
        }
      } else {
         console.warn(`[Auth Middleware] Token decoded but no ID found for path ${requestPath}.`)
         throw createError({ statusCode: 401, statusMessage: 'Invalid token payload.' })
      }
    } catch (error: unknown) {
      console.error(`[Auth Middleware] Invalid token for path ${requestPath}:`, error instanceof Error ? error.message : 'Unknown error')
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token.' })
    }
  }

  if (process.env.NODE_ENV === 'development' && !event.context.auth?.user) {
    console.warn(`[Auth Middleware] DEV MODE: No valid token for protected route ${requestPath}. Setting mock user.`)
    const mockUserId = 'dev-user-id-xxxxxxxx'
    event.context.auth = {
      user: {
        _id: mockUserId as string,
        id: mockUserId,
        username: 'dev-user',
        email: 'dev@example.com',
      }
    }
    return // 开发模式下设置了模拟用户，则返回
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Authorization token is missing or invalid.'
  })
})