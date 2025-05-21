import { NovelModel } from "~/server/models";
import type { ApiResponse } from '~/types/apiresponse';
import type { Novel } from '~/types/novel/novelinfo';

// 辅助函数：获取已完结小说数据
async function getFinishedNovels(): Promise<Novel[]> {
    const rawNovels = await NovelModel.find({ status: '已完结' }) // 查询已完结的小说
      .select('_id title author cover_url status') // 选择需要的字段，增加了简介
      .lean(); 
  
    // 将原始数据映射到 Novel 结构
    const finishedNovels:Novel[] = rawNovels.map((novel) => ({
      _id: novel._id.toString(),
      title: novel.title,
      author: novel.author,
      cover_url: novel.cover_url,
      status: novel.status || '连载中'
    }));
    return finishedNovels;
}

export default defineEventHandler(async (event): Promise<ApiResponse<Novel[]>> => {
    try {
      const query = getQuery(event);
      const limit = parseInt(query.limit as string) || 20; // 默认随机抽取20条

      if (limit <= 0 || limit > 100) { // 示例校验，比如最多随机100条
        setResponseStatus(event, 400);
        return {
          code: 400,
          message: '无效的 limit 参数，允许范围 1-100',
          data: null
        };
      }
  
      const allFinishedNovels = await getFinishedNovels();
      let responseData: Novel[] = [];
      let message = '';

      if (allFinishedNovels.length === 0) {
        message = '暂无已完结小说';
        // 如果没有已完结小说，也应该返回空数组而不是null，保持data类型的统一
        responseData = []; 
      } else if (allFinishedNovels.length <= limit) {
        responseData = allFinishedNovels;
        message = `获取所有 ${allFinishedNovels.length} 本已完结小说成功 (因总数不超过 ${limit})`;
      } else {
        // Fisher-Yates shuffle 算法随机打乱数组副本
        const shuffled = [...allFinishedNovels].sort(() => 0.5 - Math.random());
        responseData = shuffled.slice(0, limit);
        message = `随机获取 ${limit} 本已完结小说成功`;
      }
  
      return {
        code: 200,
        message,
        data: responseData
      };
  
    } catch (error: unknown) {
      const err = error as Error;
      console.error('获取已完结小说失败:', err);
      setResponseStatus(event, 500);
      return {
        code: 500,
        message: '获取已完结小说失败，服务器内部错误',
        data: null, // 在错误情况下，data为null是可接受的
      };
    }
  }); 

