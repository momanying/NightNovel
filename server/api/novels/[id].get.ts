import { Novel, Volume } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    
    if (!id) {
      return {
        code: 400,
        message: '小说ID不能为空'
      }
    }
    
    // 获取小说详情
    const novel = await Novel.findById(id)
    
    if (!novel) {
      return {
        code: 404,
        message: '小说不存在'
      }
    }
    
    // 增加浏览量
    await Novel.findByIdAndUpdate(id, { $inc: { views: 1 } })
    
    // 获取卷列表
    const volumes = await Volume.find({ novelId: id })
      .sort({ order: 1 })
      .populate({
        path: 'chapters',
        select: 'title order word_count'
      })
    
    return {
      code: 200,
      message: '获取小说详情成功',
      data: {
        novel,
        volumes
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取小说详情失败:', err)
    return {
      code: 500,
      message: '获取小说详情失败',
      error: err.message
    }
  }
}) 