import { verifyToken } from '~/server/api/auth/jwt'
import { BookmarkModel } from '~/server/models'

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
    const token = authorization.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return {
        code: 401,
        message: '无效的token',
        data: null
      }
    }

    // 获取请求体
    const body = await readBody(event)
    const { bookmarkId } = body

    if (!bookmarkId) {
      return {
        code: 400,
        message: '参数错误',
        data: null
      }
    }

    // 查找并确认书签属于当前用户
    const bookmark = await BookmarkModel.findOne({ 
      _id: bookmarkId, 
      userId: decoded.id 
    })

    if (!bookmark) {
      return {
        code: 404,
        message: '书签不存在或无权限删除',
        data: null
      }
    }

    // 删除书签
    await BookmarkModel.deleteOne({ _id: bookmarkId })

    return {
      code: 200,
      message: '移除成功',
      data: { bookmarkId }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('移除书架失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 