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
    const wordCount = query.wordCount as string
    const updateTime = query.updateTime as string
    
    const filter: Record<string, unknown> = {}
    
    if (category) {
      filter.category = category
    }

    if (tag && tag !== '全部类型') {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.tags = { $regex: `(^|\\s)${escapedTag}($|\\s)`, $options: 'i' };
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
    
    // 处理字数筛选
    if (wordCount) {
      switch (wordCount) {
        case '10万字以下':
          filter.word_count = { $lt: 100000 };
          break;
        case '10-30万字':
          filter.word_count = { $gte: 100000, $lt: 300000 };
          break;
        case '30-50万字':
          filter.word_count = { $gte: 300000, $lt: 500000 };
          break;
        case '50-100万字':
          filter.word_count = { $gte: 500000, $lt: 1000000 };
          break;
        case '100万字以上':
          filter.word_count = { $gte: 1000000 };
          break;
      }
    }
    
    // 处理更新时间筛选
    if (updateTime) {
      const now = new Date();
      let daysAgo;
      
      switch (updateTime) {
        case '三日内':
          daysAgo = 3;
          break;
        case '七日内':
          daysAgo = 7;
          break;
        case '半月内':
          daysAgo = 15;
          break;
        case '一月内':
          daysAgo = 30;
          break;
        default:
          daysAgo = 0;
      }
      
      if (daysAgo > 0) {
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - daysAgo);
        filter.lastUpdate = { $gte: pastDate.toISOString().split('T')[0] };
      }
    }
    
    // 构建排序条件
    let sortCriteria: Record<string, 1 | -1> = { lastUpdate: -1 }; // Default sort order

    if (sortQuery && sortQuery !== '不限') {
      const direction = orderQuery === 'asc' ? 1 : -1;
      const sortMap: { [key: string]: string } = {
        '更新时间': 'lastUpdate',
        '点击量': 'views',
        '收藏量': 'bookmarksCount', // Assuming you have these fields
        '推荐量': 'recommendationsCount',
        '评论量': 'commentsCount'
      };
      
      const sortField = sortMap[sortQuery];
      if (sortField) {
        sortCriteria = { [sortField]: direction };
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