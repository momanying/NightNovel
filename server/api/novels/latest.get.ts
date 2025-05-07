import { Novel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 10
    
    // 查询最新小说（基于创建时间）
    const novels = await Novel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title author cover_url introduction lastUpdate')
    
    return {
      code: 200,
      message: '获取最新小说成功',
      data: novels
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取最新小说失败:', err)
    return {
      code: 500,
      message: '获取最新小说失败',
      error: err.message
    }
  }
}) 