import type { Novel } from '~/types/novel/novelinfo';
import type { ChapterDetail } from '~/types/novel/chapter';
import type { User, UserWithBookmarks } from '~/types/auth/user'
import type { ApiResponse } from '~/types/auth'
import type { Bookmark } from '~/types/novel/bookmark';
import type { ReadingHistory } from '~/types/novel/readhistory';
import type { Comment, CommentReply } from '@/types/comment';
import type { Volume } from '~/types/novel/volume';
// 小说相关API
export const novelApi = {
  // 获取小说列表
  getList: (params?: { page?: number; limit?: number; category?: string; tag?: string; keyword?: string }) => 
    useFetch<ApiResponse<{novels: Novel[]; pagination: {total: number; page: number; limit: number; totalPages: number}}>>('/api/novels', { 
      method: 'GET', 
      query: params 
    }),

  //获取推荐小说
  getrecommond: () => useFetch<ApiResponse<{novel: Novel}>>('/api/novels/random',{
    method: 'GET'
  }),
  
  // 获取最新小说
  getLatest: (limit?: number) => useFetch<ApiResponse<Novel[]>>('/api/novels/latest', { 
    method: 'GET',
    query: { limit }
  }),
  
  // 获取热门小说
  getTop: (limit?: number) => useFetch<ApiResponse<Novel[]>>('/api/novels/top', {
    method: 'GET',
    query: { limit },
    server: true,
    key: `top-novels-${limit || 10}`
  }),
  
  // 获取小说详情
  getNovelById: (id: number | string) => useFetch<ApiResponse<{novel: Novel; volumes: Volume[]}>>(
    `/api/novels/${id}`
  ),  
  
  // 获取小说章节内容
  getChapter: (novelId: number | string, chapterId: number | string) => 
    useFetch<ApiResponse<{
      chapter: ChapterDetail;
      prevChapter: {id: string; title: string; order: number} | null;
      nextChapter: {id: string; title: string; order: number} | null;
    }>>(`/api/novels/${novelId}/chapters/${chapterId}`),
  
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

// 用户相关API
export const userApi = {
  // 用户登录
  login: (username: string, password: string) =>
    $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/login', { method: 'POST', body: { username, password } }),
  
  // 用户注册
  register: (username: string, email: string, password: string) => 
    $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/register', { method: 'POST', body: { username, email, password } }),
  
  // 获取用户信息
  getUserInfo: () => $fetch<ApiResponse<{user: UserWithBookmarks}>>(`/api/auth/user`, { method: 'GET' }),
  
  // 添加书签
  addBookmark: (novelId: number, chapterId?: number) => 
    $fetch<ApiResponse<{bookmark: Bookmark}>>(`/api/bookmarks/add`, { method: 'POST', body: { novelId, chapterId } }),
  
  // 移除书签
  removeBookmark: (bookmarkId: number) => 
    $fetch<ApiResponse<{success: boolean, bookmarkId: number}>>(`/api/bookmarks/remove`, { method: 'POST', body: { bookmarkId } }),
  
  // 添加阅读历史
  addHistory: (novelId: number, chapterId: number) => 
    $fetch<ApiResponse<{history: ReadingHistory}>>(`/api/history/add`, { method: 'POST', body: { novelId, chapterId } }),
};

// 评论相关API
export const commentApi = {
  // 获取小说评论
  getComments: (novelId: number) => 
    $fetch<ApiResponse<{comments: Comment[], total: number}>>(`/api/comments/${novelId}`),
  
  // 发表评论
  postComment: (novelId: number, content: string, rating?: number) => 
    $fetch<ApiResponse<{comment: Comment}>>(`/api/comments/post`, { method: 'POST', body: { novelId, content, rating } }),
  
  // 回复评论
  replyComment: (commentId: number, content: string) => 
    $fetch<ApiResponse<{reply: CommentReply}>>(`/api/comments/reply`, { method: 'POST', body: { commentId, content } }),
}; 