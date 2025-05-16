import type { ApiResponse } from '~/types/apiresponse';
import type { User, UserWithBookmarks } from '~/types/user/user'
import type { ReadingHistory } from '~/types/novel/readhistory';
import type { IBookmarkData } from '~/types/novel/bookmark';
// 用户相关API
export const userApi = {
    // 用户登录
    login: (username: string, password: string) =>
      $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/login', { method: 'POST', body: { username, password } }),
    
    // 用户注册
    register: (username: string, email: string, password: string) => 
      $fetch<ApiResponse<{token: string, user: User}>>('/api/auth/register', { method: 'POST', body: { username, email, password } }),
  
    // 退出登录
    logout: () => 
      $fetch<ApiResponse<{success: boolean}>>('/api/auth/logout', {
        method: 'POST'
    }),

    // 获取用户信息
    getUserInfo: (token?: string) => 
        $fetch<ApiResponse<{user: UserWithBookmarks}>>('/api/auth/user', {
          method: 'GET',
          headers: token ? {
            Authorization: `Bearer ${token}`
        } : {}
    }),

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
}