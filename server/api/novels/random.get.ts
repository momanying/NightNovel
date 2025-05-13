import { Novel } from '~/server/models'
import { incrementNovelViews } from '~/server/utils/novel'
import type { Types } from 'mongoose'

// 定义缓存小说的接口
interface CachedNovel {
  _id: Types.ObjectId | string;
  title: string;
  author: string;
  cover_url: string;
  lastUpdate: Date;
}

// 缓存设置
const CACHE_TTL = 1000 * 60 * 30; // 30分钟缓存
const INITIAL_CACHE_SIZE = 50; // 初始缓存50本
const TOTAL_CACHE_SIZE = 100; // 最终缓存100本
let novelCache: CachedNovel[] = [];
let lastCacheTime = 0;
let isInitialized = false;
let isUpdating = false;

// 转换数据库返回的小说为缓存格式
const convertToCachedNovel = (novel: Record<string, string | number | boolean | Date | null | undefined | object>): CachedNovel => {
  return {
    _id: novel._id as string,
    title: novel.title as string,
    author: novel.author as string,
    cover_url: novel.cover_url as string,
    lastUpdate: novel.lastUpdate ? new Date(novel.lastUpdate as string | Date) : new Date()
  };
};

// 异步扩展缓存
const expandCacheAsync = async () => {
  if (isUpdating) return;
  
  // 如果已经达到目标缓存大小，不再尝试扩展
  if (novelCache.length >= TOTAL_CACHE_SIZE) {
    console.log(`缓存已达到目标大小 ${TOTAL_CACHE_SIZE}，不再扩展`);
    return;
  }
  
  try {
    isUpdating = true;
    console.log(`尝试扩展缓存，当前:${novelCache.length}/${TOTAL_CACHE_SIZE}`);
    
    // 获取所有已缓存的ID
    const existingIds = new Set(novelCache.map(novel => novel._id.toString()));
    
    // 跳过已有的小说，获取热门小说作为补充
    const additionalNovels = await Novel.find({
      _id: { $nin: Array.from(existingIds) } // 排除已缓存的ID
    })
      .sort({ views: -1, rating: -1 })
      .limit(TOTAL_CACHE_SIZE - novelCache.length)
      .select('_id title author cover_url views rating lastUpdate')
      .lean();
    
    if (additionalNovels && additionalNovels.length > 0) {
      // 过滤掉已经在缓存中的小说 (双重保险)
      const newNovels = additionalNovels.filter(novel => 
        !existingIds.has(novel._id.toString())
      );
      
      if (newNovels.length > 0) {
        novelCache = [...novelCache, ...newNovels.map(convertToCachedNovel)];
        console.log(`缓存扩展完成，现共有${novelCache.length}本小说`);
      } else {
        console.log('没有新的小说可以添加到缓存');
      }
    } else {
      console.log('数据库中没有更多符合条件的小说');
    }
  } catch (error) {
    console.error('扩展缓存失败:', error);
  } finally {
    isUpdating = false;
  }
};

// 初始化缓存
const initializeCache = async () => {
  try {
    const now = Date.now();
    
    // 获取初始小说缓存（最新更新的50本）
    const latestNovels = await Novel.find()
      .sort({ lastUpdate: -1 }) // 按更新时间降序排序
      .limit(INITIAL_CACHE_SIZE)
      .select('_id title author cover_url views rating lastUpdate')
      .lean();
    
    if (latestNovels && latestNovels.length > 0) {
      novelCache = latestNovels.map(convertToCachedNovel);
      lastCacheTime = now;
      isInitialized = true;
      console.log(`初始缓存已加载，共${novelCache.length}本最新小说`);
      
      // 异步加载更多热门小说到缓存
      setTimeout(() => {
        expandCacheAsync();
      }, 100);
    }
  } catch (error) {
    console.error('初始化缓存失败:', error);
  }
};

export default defineEventHandler(async (_event) => {
  try {
    const now = Date.now();
    
    // 检查缓存是否初始化或过期
    if (!isInitialized || novelCache.length === 0 || (now - lastCacheTime) > CACHE_TTL) {
      await initializeCache();
    } else if (novelCache.length < TOTAL_CACHE_SIZE && !isUpdating) {
      // 如果缓存未满并且不在更新中，异步扩展缓存
      setTimeout(() => {
        expandCacheAsync();
      }, 1000); // 增加延迟，避免频繁尝试
    }
    
    // 如果有缓存，从缓存中随机选择
    if (novelCache.length > 0) {
      const randomIndex = Math.floor(Math.random() * novelCache.length);
      const novel = novelCache[randomIndex];
      
      // 异步增加浏览量，不阻塞响应
      incrementNovelViews(novel._id.toString()).catch(err => {
        console.error('增加浏览量失败:', err);
      });
      
      return {
        code: 200,
        message: '获取随机小说成功',
        data: {
          novel
        }
      }
    }
    
    // 如果缓存为空，回退到轻量级查询
    const totalNovels = await Novel.countDocuments();
    
    if (totalNovels === 0) {
      return {
        code: 404,
        message: '数据库中没有小说',
        data: null
      }
    }
    
    // 生成一个随机索引
    const randomIndex = Math.floor(Math.random() * totalNovels);
    
    // 使用skip跳过随机数量的文档，然后获取一个文档
    const novel = await Novel.findOne()
      .skip(randomIndex)
      .select('_id title author cover_url views rating')
      .lean();
    
    if (!novel) {
      return {
        code: 404,
        message: '未找到小说',
        data: null
      }
    }
    
    // 异步增加浏览量
    incrementNovelViews(novel._id.toString()).catch(err => {
      console.error('增加浏览量失败:', err);
    });
    
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