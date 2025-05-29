import { ChapterModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    const novelId = event.context.params?.novelId
    const chapterId = event.context.params?.chapterId
    
    if (!novelId || !chapterId) {
      return {
        code: 400,
        message: '小说ID和章节ID不能为空'
      }
    }
    
    // 获取章节内容
    const chapter = await ChapterModel.findById(chapterId)
    
    if (!chapter) {
      return {
        code: 404,
        message: '章节不存在'
      }
    }
    
    // 获取前一章和后一章
    const prevChapter = await ChapterModel.findOne({
      volumeId: chapter.volumeId,
      order: { $lt: chapter.order }
    }).sort({ order: -1 })

    const nextChapter = await ChapterModel.findOne({
      volumeId: chapter.volumeId,
      order: { $gt: chapter.order }
    }).sort({ order: 1 })
    
    return {
      code: 200,
      message: '获取章节内容成功',
      data: {
        chapter,
        prevChapter: prevChapter ? {
          id: prevChapter._id,
          title: prevChapter.title,
          order: prevChapter.order
        } : null,
        nextChapter: nextChapter ? {
          id: nextChapter._id,
          title: nextChapter.title,
          order: nextChapter.order
        } : null
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取章节内容失败:', err)
    return {
      code: 500,
      message: '获取章节内容失败',
      error: err.message
    }
  }
}) 