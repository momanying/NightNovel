import { NovelModel } from '~/server/models'

export default defineEventHandler(async () => {
  try {
    // 聚合查询，获取所有分类及其小说数量
    const categories = await NovelModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', count: 1 } }
    ])
    
    return {
      code: 200,
      message: '获取小说分类成功',
      data: categories
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取小说分类失败:', err)
    return {
      code: 500,
      message: '获取小说分类失败',
      error: err.message
    }
  }
}) 