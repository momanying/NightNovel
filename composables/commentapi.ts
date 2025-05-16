import type { Comment, CommentReply } from '~/types/comment';
import type { ApiResponse } from '~/types/apiresponse';

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