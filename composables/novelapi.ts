import type { Novel } from '~/types/novel/novelinfo';
import type { ChapterDetail } from '~/types/novel/chapter';
import type { ApiResponse } from '~/types/apiresponse';
// 小说相关API
export const novelApi = {
    // 获取小说列表
    getList: (params?: { page?: number; limit?: number; category?: string; tag?: string; keyword?: string }) => 
      useFetch<ApiResponse<{novels: Novel[]; pagination: {total: number; page: number; limit: number; totalPages: number}}>>('/api/novels', { 
        method: 'GET', 
        query: params 
      }),  
    
    // 获取小说章节内容
    getChapter: (novelId: number | string, chapterId: number | string) => 
      useFetch<ApiResponse<{
        chapter: ChapterDetail;
        prevChapter: {id: string; title: string; order: number} | null;
        nextChapter: {id: string; title: string; order: number} | null;
      }>>(`/api/novels/${novelId}/${chapterId}`),
    
    // 搜索小说
    searchNovels: (keyword: string, page?: number, limit?: number) => 
      useFetch<ApiResponse<{
        novels: Novel[]; 
        pagination: {total: number; page: number; limit: number; totalPages: number}
      }>>('/api/novels/search', { 
        method: 'GET', 
        query: { keyword, page, limit } 
      }),
      
    // 获取小说分类
    getCategories: () => useFetch<ApiResponse<{name: string; count: number}[]>>('/api/novels/categories')
  };