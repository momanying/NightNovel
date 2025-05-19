import { verifyToken } from '~/server/api/auth/jwt'
import { BookmarkModel, NovelModel } from '~/server/models'

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
    const { novelId, chapterId } = body

    if (!novelId) {
      return {
        code: 400,
        message: '参数错误，需要提供小说ID',
        data: null
      }
    }

    // 检查小说是否存在
    const novel = await NovelModel.findById(novelId)
    if (!novel) {
      return {
        code: 404,
        message: '小说不存在',
        data: null
      }
    }

    // 尝试查找现有书签
    let bookmark = await BookmarkModel.findOne({ 
      userId: decoded.id,
      novelId
    })

    if (bookmark) {
      // 更新现有书签
      bookmark.chapterId = chapterId || bookmark.chapterId
      await bookmark.save()
    } else {
      // 创建新书签
      bookmark = await BookmarkModel.create({
        userId: decoded.id,
        novelId,
        chapterId: chapterId || null
      })
    }

    return {
      code: 200,
      message: '添加成功',
      data: { bookmarkId: bookmark._id }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('添加书架失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 