import { UserModel } from '../models'
import { defineEventHandler, getRequestHeader, getRequestURL, createError, type H3Event } from 'h3'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: string
  exp: number
  iat: number
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const JWT_SECRET = config.jwtSecret

  if (!JWT_SECRET) {
    console.error('[Auth Middleware] Missing JWT_SECRET in runtimeConfig')
    throw createError({ statusCode: 500, statusMessage: 'Server misconfiguration.' })
  }

  const { pathname } = getRequestURL(event)

  // 开发环境，支持 mock user
  if (process.env.NODE_ENV === 'development') {
    const authHeader = getRequestHeader(event, 'Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
        const user = await UserModel.findById(decoded.id).select('-password').lean()
        if (user) {
          event.context.auth = { user }
          return
        }
      } catch (error) {
        console.warn(`[Auth Middleware] DEV: Invalid token — ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // fallback mock user
    const mockUser = await UserModel.findOne().select('-password').lean()
    if (mockUser) {
      console.log(`[Auth Middleware] DEV: Using mock user ${mockUser.username}`)
      event.context.auth = { user: mockUser }
    } else {
      console.warn('[Auth Middleware] DEV: No users in database for mock auth.')
    }
    return
  }

  // 生产环境
  const isProtectedRoute = (() => {
    // 默认保护所有修改性操作
    if (event.method !== 'GET' && event.method !== 'HEAD' && event.method !== 'OPTIONS') {
      // 但排除 auth 路由
      if (pathname.startsWith('/api/auth/')) {
        return false
      }
      return true
    }

    // 对于GET等安全方法，按需保护
    if (pathname.startsWith('/api/user') || pathname.startsWith('/user')) {
      return true
    }

    return false
  })()

  if (!isProtectedRoute) {
    return // 公开路由，直接通过
  }

  // 受保护路由，验证 token
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization token is missing or invalid.' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const user = await UserModel.findById(decoded.id).select('-password')
    if (user) {
      event.context.auth = { user }
      return
    } else {
      console.warn(`[Auth Middleware] PROD: No user found for token id ${decoded.id}`)
      throw createError({ statusCode: 401, statusMessage: 'User not found.' })
    }
  } catch (error) {
    console.error(`[Auth Middleware] PROD: Invalid token — ${error instanceof Error ? error.message : 'Unknown error'}`)
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token.' })
  }
})
