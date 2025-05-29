import { verifyToken } from '~/server/api/auth/jwt'
import { ReadingHistoryModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取Authorization头
    const authorization = event.headers.get('Authorization')
    if (!authorization) {
      return {
        code: 401,
        message: '未登录',
        data: null
      }
    }

    // 验证token
    try {
      const token = authorization.replace('Bearer ', '')
      const decoded = verifyToken(token)
      
      if (!decoded || !decoded.id) {
        return {
          code: 401,
          message: '无效的token',
          data: null
        }
      }

      // 获取用户阅读历史数量
      const count = await ReadingHistoryModel.countDocuments({ userId: decoded.id })

      return {
        code: 200,
        message: '获取成功',
        data: { count }
      }
    } catch {
      return {
        code: 401,
        message: '无效的token',
        data: null
      }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('获取阅读历史数量失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 