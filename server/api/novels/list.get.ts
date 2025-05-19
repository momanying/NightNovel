import { NovelModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const category = query.category as string
    const tag = query.tag as string
    const keyword = query.keyword as string
    
    // 构建查询条件
    const filter: Record<string, unknown> = {}
    
    if (category) {
      filter.category = category
    }
    
    if (tag) {
      filter['tags.name'] = tag
    }
    
    if (keyword) {
      filter.$text = { $search: keyword }
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 查询小说列表
    const novels = await NovelModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-volumes')
    
    // 获取总数
    const total = await NovelModel.countDocuments(filter)
    
    return {
      code: 200,
      message: '获取小说列表成功',
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
    console.error('获取小说列表失败:', err)
    return {
      code: 500,
      message: '获取小说列表失败',
      error: err.message
    }
  }
}) 