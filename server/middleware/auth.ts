import { verifyToken } from '../api/auth/jwt'
import { User } from '../models/user'

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
  '/api/novels/top'       // 热门小说
]

export default defineEventHandler(async (event) => {
  // 检查是否是公开路由
  if (PUBLIC_ROUTES.includes(event.path) || event.path.startsWith('/api/novels/')) {
    return
  }

  // 在开发环境中跳过认证
  if (process.env.NODE_ENV === 'development') {
    // 设置一个默认用户用于开发
    event.context.user = {
      id: 'dev-user-id',
      username: 'dev-user',
      email: 'dev@example.com'
    }
    return
  }

  try {
    const token = event.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError({
        statusCode: 401,
        message: '未提供认证令牌'
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.id)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户不存在'
      })
    }

    // 将用户信息添加到事件上下文
    event.context.user = {
      id: user._id,
      username: user.username,
      email: user.email
    }

  } catch (error: unknown) {
    console.error('认证失败:', error)
    throw createError({
      statusCode: 401,
      message: error instanceof Error ? error.message : '认证失败'
    })
  }
})