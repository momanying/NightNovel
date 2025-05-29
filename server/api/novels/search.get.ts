import { NovelModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const keyword = query.keyword as string
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const category = query.category as string
    const status = query.status as string
    
    if (!keyword && !category && !status) {
      return {
        code: 400,
        message: '搜索关键词或筛选条件不能为空'
      }
    }
    
    // 构建搜索条件
    type SearchCondition = {
      $text?: { $search: string };
      $or?: Array<Record<string, RegExp>>;
      category?: string;
      status?: string;
    }
    
    const searchConditions: SearchCondition = {}
    
    // 关键词搜索
    if (keyword) {
      // 1. 首先尝试全文索引搜索
      if (keyword.length >= 2) {
        searchConditions.$text = { $search: keyword }
      } else {
        // 2. 对于单字搜索，使用正则表达式搜索标题和作者
        searchConditions.$or = [
          { title: new RegExp(keyword, 'i') },
          { author: new RegExp(keyword, 'i') }
        ]
      }
    }
    
    // 添加分类筛选
    if (category) {
      searchConditions.category = category
    }
    
    // 添加状态筛选
    if (status) {
      searchConditions.status = status
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 执行搜索查询
    let novels
    
    if (keyword && keyword.length >= 2 && searchConditions.$text) {
      // 使用全文索引搜索时，按相关度排序
      novels = await NovelModel.find(
        searchConditions,
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .select('-volumes')
    } else {
      // 使用其他条件搜索时，按更新时间排序
      novels = await NovelModel.find(searchConditions)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-volumes')
    }
    
    // 获取总数
    const total = await NovelModel.countDocuments(searchConditions)
    
    // 处理没有搜索结果但有拼写错误的情况
    if (keyword && novels.length === 0 && !category && !status) {
      // 尝试使用更宽松的搜索条件再次搜索
      const relaxedSearch = await NovelModel.find(
        { $or: [
          { title: new RegExp(keyword.split('').join('.*'), 'i') },
          { author: new RegExp(keyword.split('').join('.*'), 'i') }
        ]},
      )
        .limit(limit)
        .select('-volumes')
      
      if (relaxedSearch.length > 0) {
        return {
          code: 200,
          message: '搜索到可能相关的小说',
          data: {
            novels: relaxedSearch,
            didYouMean: true,
            pagination: {
              total: relaxedSearch.length,
              page: 1,
              limit,
              totalPages: 1
            }
          }
        }
      }
    }
    
    // 定义筛选分类类型
    type FilterItem = { name: string; count: number }
    
    // 提取热门分类和状态，用于搜索筛选
    const categories: FilterItem[] = []
    const statuses: FilterItem[] = []
    
    if (novels.length > 0 && !category) {
      // 统计搜索结果中的分类
      const categoryMap = new Map<string, number>()
      novels.forEach((novel) => {
        if (novel.category) {
          if (!categoryMap.has(novel.category)) {
            categoryMap.set(novel.category, 1)
          } else {
            categoryMap.set(novel.category, categoryMap.get(novel.category)! + 1)
          }
        }
      })
      
      // 转换为数组并排序
      categories.push(...Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5))
    }
    
    if (novels.length > 0 && !status) {
      // 统计搜索结果中的状态
      const statusMap = new Map<string, number>()
      novels.forEach((novel) => {
        if (novel.status) {
          if (!statusMap.has(novel.status)) {
            statusMap.set(novel.status, 1)
          } else {
            statusMap.set(novel.status, statusMap.get(novel.status)! + 1)
          }
        }
      })
      
      // 转换为数组
      statuses.push(...Array.from(statusMap.entries())
        .map(([name, count]) => ({ name, count })))
    }
    
    return {
      code: 200,
      message: '搜索小说成功',
      data: {
        novels,
        filters: {
          categories,
          statuses
        },
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