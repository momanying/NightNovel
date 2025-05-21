import { NovelModel } from '~/server/models';
import type { ApiResponse } from '~/types/apiresponse'; // 假设你有这个通用响应类型
import type { Novel } from '~/types/novel/novelinfo';

// 辅助函数：获取并处理评分最高小说数据
async function getBestNovels(limit: number): Promise<Novel[]> {
  const rawNovels = await NovelModel.find()
    .sort({ rating: -1 }) // 按评分降序排序
    .limit(limit)
    .select('_id title author cover_url tags introduction rating') // 选择需要的字段
    .lean(); // 使用 lean() 获取普通JS对象

  // 将原始数据映射到 Novel 结构
  const bestNovels:Novel[] = rawNovels.map((novel) => ({
    _id: novel._id.toString(),
    title: novel.title,
    author: novel.author,
    cover_url: novel.cover_url,
    introduction: novel.introduction || '', // 确保为字符串
    rating: novel.rating || 0,
    tags: novel.tags || '',
  }));
  return bestNovels;
}

export default defineEventHandler(async (event): Promise<ApiResponse<Novel[]>> => {
  try {
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 10; // 默认10条

    if (limit <= 0 || limit > 50) { // 示例校验
      setResponseStatus(event, 400);
      return {
        code: 400,
        message: '无效的 limit 参数，允许范围 1-50',
        data: null
      };
    }

    const bestNovelsData = await getBestNovels(limit);

    return {
      code: 200,
      message: '获取高分小说成功',
      data: bestNovelsData
    };

  } catch (error: unknown) {
    const err = error as Error;
    console.error('获取高分小说失败:', err);
    setResponseStatus(event, 500);
    return {
      code: 500,
      message: '获取高分小说失败，服务器内部错误',
      data: null,
    };
  }
}); 