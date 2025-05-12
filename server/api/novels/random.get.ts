import { Novel } from '~/server/models'
import { incrementNovelViews } from '~/server/utils/novel'

export default defineEventHandler(async (_event) => {
  try {
    // 方法一：使用聚合管道实现随机抽取，适用于大型数据库
    const randomNovels = await Novel.aggregate([
      { $sample: { size: 1 } },
      { $project: { 
        _id: 1, 
        title: 1, 
        author: 1, 
        cover_url: 1, 
        views: 1, 
        rating: 1 
      }}
    ])
    
    if (randomNovels && randomNovels.length > 0) {
      const novel = randomNovels[0]
      
      // 增加浏览量
      await incrementNovelViews(novel._id.toString())
      
      return {
        code: 200,
        message: '获取随机小说成功',
        data: {
          novel
        }
      }
    }
    
    // 如果聚合管道方法失败，回退到传统方法
    // 获取数据库中小说的总数量
    const totalNovels = await Novel.countDocuments()
    
    if (totalNovels === 0) {
      return {
        code: 404,
        message: '数据库中没有小说',
        data: null
      }
    }
    
    // 生成一个随机索引
    const randomIndex = Math.floor(Math.random() * totalNovels)
    
    // 使用skip跳过随机数量的文档，然后获取一个文档
    const novel = await Novel.findOne()
      .skip(randomIndex)
      .select('_id title author cover_url introduction category status views rating')
    
    if (!novel) {
      return {
        code: 404,
        message: '未找到小说',
        data: null
      }
    }
    
    // 增加浏览量
    await incrementNovelViews(novel._id.toString())
    
    return {
      code: 200,
      message: '获取随机小说成功',
      data: {
        novel
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('获取随机小说失败:', err)
    return {
      code: 500,
      message: '获取随机小说失败',
      error: err.message
    }
  }
}) 