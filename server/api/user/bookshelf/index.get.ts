import { verifyToken } from '~/server/api/auth/jwt'
import { Bookmark, Novel } from '~/server/models'
import type { Types } from 'mongoose'
import type { IBookmarkData } from '~/types/novel/bookmark'

// 定义populate后的Mongoose文档类型
interface PopulatedNovelDoc {
  _id: Types.ObjectId
  title: string
  author: string
  cover_url: string
}

// Mongoose文档类型定义
interface PopulatedBookmarkDoc {
  _id: Types.ObjectId
  userId: Types.ObjectId
  novelId: PopulatedNovelDoc
  chapterId?: Types.ObjectId
  updatedAt: Date
  createdAt: Date
}

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

    // 获取用户书架中的小说，按更新时间降序排序
    const bookmarks = await Bookmark.find({ userId: decoded.id })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'novelId',
        model: Novel,
        select: '_id title author cover_url'
      })
      .lean()

    // 转换为前端需要的格式
    const formattedBookmarks: IBookmarkData[] = (bookmarks as unknown as PopulatedBookmarkDoc[]).map((bookmark) => ({
      id: bookmark._id.toString(),
      userId: bookmark.userId.toString(),
      novelId: bookmark.novelId._id.toString(),
      chapterId: bookmark.chapterId?.toString(),
      novel: {
        id: bookmark.novelId._id.toString(),
        title: bookmark.novelId.title,
        author: bookmark.novelId.author,
        cover_url: bookmark.novelId.cover_url
      },
      updatedAt: bookmark.updatedAt.toISOString(),
      createdAt: bookmark.createdAt.toISOString()
    }))

    return {
      code: 200,
      message: '获取成功',
      data: { bookmarks: formattedBookmarks }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('获取书架失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 