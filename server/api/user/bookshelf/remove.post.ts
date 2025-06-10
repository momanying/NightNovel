import { verifyToken } from '~/server/api/auth/jwt'
import { BookmarkModel } from '~/server/models'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    // 获取Authorization头
    const authorization = event.headers.get('Authorization')
    if (!authorization) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { message: '请先登录' } })
    }

    // 验证token
    const token = authorization.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.id) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { message: '无效的凭证' } })
    }
    const userId = new mongoose.Types.ObjectId(decoded.id)

    // 获取请求体
    const body = await readBody(event)
    const { novelId } = body

    if (!novelId) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: '无效的小说ID' } })
    }

    // 查找并确认书签属于当前用户
    const result = await BookmarkModel.deleteOne({ userId, novelId })

    if (result.deletedCount === 0) {
      // This might happen if the user clicks twice, not a server error.
      throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: '小说未在书架中' } })
    }

    return {
      code: 200,
      message: '已成功从书架移除',
    }
  } catch (error) {
    const h3Error = error as { statusCode?: number }
    if (h3Error.statusCode) throw error
    console.error('从书架移除失败:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: { message: '服务器内部错误' } })
  }
}) 