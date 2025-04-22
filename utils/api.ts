import type { Novel } from '~/types/novel/novel';
import type { Chapter, ChapterDetail } from '~/types/novel/chapter';
import type { User, UserWithBookmarks } from '~/types/auth/user'
import type { ApiResponse } from '~/types/auth'
import type { Bookmark } from '~/types/novel/bookmark';
import type { ReadingHistory } from '~/types/novel/readhistory';
import type { Comment, CommentReply } from '@/types/comment';

// 小说相关API
export const novelApi = {
  // 获取推荐小说
  getFeatured: () => $fetch<ApiResponse<Novel[]>>('/api/novels/featured'),
  
  // 获取最新小说
  getLatest: () => $fetch<ApiResponse<Novel[]>>('/api/novels/latest'),
  // 获取热门小说
  getTop: () => $fetch<ApiResponse<Novel[]>>('/api/novels/top'),
  
  // 获取小说详情
  getNovelById: (id: number) => $fetch<ApiResponse<Novel>>(`/api/novels/${id}`),  
  
  // 获取小说章节列表
  getChapters: (novelId: number) => $fetch<ApiResponse<Chapter[]>>(`/api/novels/${novelId}/chapters`),
  
  // 获取章节内容
  getChapter: (novelId: number, chapterId: number) => 
    $fetch<ApiResponse<ChapterDetail>>(`/api/novels/${novelId}/chapters/${chapterId}`),
  
  // 按分类获取小说
  getNovelsByCategory: (categoryId: number | string) => 
    $fetch<ApiResponse<Novel[]>>(`/api/categories/${categoryId}/novels`),
    
  // 搜索小说
  searchNovels: (keyword: string) => 
    $fetch<ApiResponse<Novel[]>>(`/api/novels/search`, { method: 'GET', query: { keyword } }),
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