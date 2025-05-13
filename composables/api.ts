import type { Novel } from '~/types/novel/novelinfo';
import type { ChapterDetail } from '~/types/novel/chapter';
import type { User, UserWithBookmarks } from '~/types/auth/user'
import type { ApiResponse } from '~/types/auth'
import type { ReadingHistory } from '~/types/novel/readhistory';
import type { Comment, CommentReply } from '@/types/comment';
import type { IBookmarkData } from '~/types/novel/bookmark';
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

// 用户相关API
export const userApi = {
  // 用户登录
  login: (username: string, password: string) =>
    $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/login', { method: 'POST', body: { username, password } }),
  
  // 用户注册
  register: (username: string, email: string, password: string) => 
    $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/register', { method: 'POST', body: { username, email, password } }),
  
  // 获取用户信息
  getUserInfo: (token?: string) => 
    $fetch<ApiResponse<{user: UserWithBookmarks}>>('/api/auth/user', {
      method: 'GET',
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    }),

  // 退出登录
  logout: () => 
    $fetch<ApiResponse<{success: boolean}>>('/api/auth/logout', {
      method: 'POST'
    }),
  
  // 获取书架数量
  getBookshelfCount: (token: string) =>
    $fetch<ApiResponse<{count: number}>>('/api/user/bookshelf/count', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  
  // 获取评论数量
  getCommentsCount: (token: string) =>
    $fetch<ApiResponse<{count: number}>>('/api/user/comments/count', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  
  // 获取浏览历史数量
  getHistoryCount: (token: string) =>
    $fetch<ApiResponse<{count: number}>>('/api/user/history/count', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  
  // 添加书签
  addBookmark: (novelId: number, chapterId?: number) => 
    $fetch<ApiResponse<{bookmark: IBookmarkData}>>(`/api/bookmarks/add`, { method: 'POST', body: { novelId, chapterId } }),
  
  // 移除书签
  removeBookmark: (bookmarkId: number) => 
    $fetch<ApiResponse<{success: boolean, bookmarkId: number}>>(`/api/bookmarks/remove`, { method: 'POST', body: { bookmarkId } }),
  
  // 添加阅读历史
  addHistory: (novelId: number, chapterId: number) => 
    $fetch<ApiResponse<{history: ReadingHistory}>>(`/api/history/add`, { method: 'POST', body: { novelId, chapterId } }),

  // 获取用户书架列表
  getBookshelf: (token: string, params?: { page?: number; limit?: number }) =>
    $fetch<ApiResponse<{bookmarks: IBookmarkData[]; pagination: {total: number; page: number; limit: number; totalPages: number}}>>('/api/user/bookshelf', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      query: params
    }),
  
  // 从书架移除
  removeFromBookshelf: (bookmarkId: number, token: string) =>
    $fetch<ApiResponse<{success: boolean}>>('/api/user/bookshelf/remove', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { bookmarkId }
    }),
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