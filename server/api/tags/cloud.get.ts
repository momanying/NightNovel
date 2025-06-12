import { NovelModel } from '~/server/models/novel'

export default defineEventHandler(async () => {
  try {
    const novels = await NovelModel.find({ tags: { $exists: true, $ne: '' } }, 'tags').lean()
    
    const tagSet = new Set<string>()
    
    novels.forEach(novel => {
      novel.tags?.split(' ').forEach(tag => {
        if (tag) {
          tagSet.add(tag)
        }
      })
    })
    
    const uniqueTags = Array.from(tagSet).sort()

    return {
      code: 200,
      message: '获取标签云成功',
      data: uniqueTags,
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取标签云失败:', err);
    return {
      code: 500,
      message: '获取标签云失败',
      error: err.message,
    }
  }
}) 