import { Novel } from '~/server/models'

/**
 * 增加小说浏览量
 * @param novelId 小说ID
 */
export const incrementNovelViews = async (novelId: string) => {
  try {
    await Novel.findByIdAndUpdate(novelId, { $inc: { views: 1 } })
    return true
  } catch (error) {
    console.error('增加小说浏览量失败:', error)
    return false
  }
}

/**
 * 更新小说评分
 * @param novelId 小说ID
 * @param rating 评分 (1-5)
 */
export const updateNovelRating = async (novelId: string, rating: number) => {
  try {
    const novel = await Novel.findById(novelId)
    if (!novel) return false
    
    // 计算新的评分
    const newRatingCount = novel.ratingCount + 1
    const newRating = ((novel.rating * novel.ratingCount) + rating) / newRatingCount
    
    // 更新评分
    await Novel.findByIdAndUpdate(novelId, {
      rating: newRating,
      ratingCount: newRatingCount
    })
    
    return true
  } catch (error) {
    console.error('更新小说评分失败:', error)
    return false
  }
} 