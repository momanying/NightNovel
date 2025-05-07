import { Novel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const keyword = query.keyword as string
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    
    if (!keyword) {
      return {
        code: 400,
        message: '搜索关键词不能为空'
      }
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 搜索小说
    const novels = await Novel.find(
      { $text: { $search: keyword } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .select('-volumes')
    
    // 获取总数
    const total = await Novel.countDocuments({ $text: { $search: keyword } })
    
    return {
      code: 200,
      message: '搜索小说成功',
      data: {
        novels,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('搜索小说失败:', err)
    return {
      code: 500,
      message: '搜索小说失败',
      error: err.message
    }
  }
}) 