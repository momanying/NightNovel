import { NovelModel } from '~/server/models'

export default defineEventHandler(async (event) => {
  event.context.auth = false

  try {
    // 从数据库获取所有小说的标签
    const novels = await NovelModel.find({}, 'tags')
    
    // 解析所有标签并计数
    const tagCounts: Record<string, number> = {}
    
    novels.forEach((novel) => {
      if (!novel.tags) return
      
      // 将标签字符串分割为数组，并计数
      const tags = novel.tags.split(/\s+/).filter(Boolean)
      
      tags.forEach((tag: string) => {
        if (tag) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        }
      })
    })
    
    // 转换为Tag数组
    const tagCloud = Object.keys(tagCounts).map(name => ({
      name,
      count: tagCounts[name]
    }))
    
    // 按标签使用频率排序（降序）
    tagCloud.sort((a, b) => b.count - a.count)
    
    // 限制标签数量，只返回前20个最常用标签
    const limitedTagCloud = tagCloud.slice(0, 20)
    
    return {
      code: 200,
      message: '获取标签云数据成功',
      data: limitedTagCloud
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取标签云数据失败:', err)
    return {
      code: 500,
      message: '获取标签云数据失败',
      error: err.message
    }
  }
}) 