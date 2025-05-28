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
    const animation = query.animation as string
    const status = query.status as string
    const sortQuery = query.sort as string
    const orderQuery = query.order as string
    
    // 构建查询条件
    const filter: Record<string, unknown> = {}
    
    if (category) {
      filter.category = category
    }
    
    if (tag) {
      filter.tags = { $regex: new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    }
    
    if (keyword) {
      filter.$text = { $search: keyword }
    }
    
    if (animation === 'true') {
      filter.animation = true
    }

    if (status === "已完结") {
      filter.status = '已完结'
    }
    
    // 构建排序条件
    let sortCriteria: Record<string, 1 | -1> = { lastUpdate: -1 }; // Default sort order

    if (sortQuery) {
      const direction = orderQuery === 'asc' ? 1 : -1;
      if (sortQuery === '资源更新时间') {
        sortCriteria = { lastUpdate: direction };
      } else if (sortQuery === '入库时间') {
        sortCriteria = { createdAt: direction };
      } else if (['周点击', '月点击', '总点击'].includes(sortQuery)) { // Assuming these map to a general 'views' field
        sortCriteria = { views: direction }; // Ensure 'views' field exists and is numeric in your model
      }
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 查询小说列表
    const novels = await NovelModel.find(filter)
      .sort(sortCriteria) // Apply dynamic sort criteria
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