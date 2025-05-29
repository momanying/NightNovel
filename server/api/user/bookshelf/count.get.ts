import { verifyToken } from '~/server/api/auth/jwt'
import { BookmarkModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取Authorization头
    const authorization = event.headers.get('token')
    if (!authorization) {
      return {
        code: 401,
        message: '未登录',
        data: null
      }
    }

    // 验证token
    const token = authorization.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return {
        code: 401,
        message: '无效的token',
        data: null
      }
    }

    // 获取用户书架中的小说数量
    const count = await BookmarkModel.countDocuments({ userId: decoded.id })

    return {
      code: 200,
      message: '获取成功',
      data: { count }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('获取书架数量失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 