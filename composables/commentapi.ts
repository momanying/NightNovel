import type { Comment, Reply } from '~/types/comment';
import type { ApiPaginatedResponse } from '~/types/apiresponse';

// Helper to construct API response type, useful if not using a generic ApiResponse elsewhere
interface CommentApiResponse<T> {
  // statusCode: number; // Nuxt $fetch handles status codes, often not needed in return type here
  // statusMessage?: string;
  data: T;
}

// 评论相关API
export const commentApi = {
  // Get comments for a novel with pagination
  getComments: (novelId: string, page: number = 1, limit: number = 10) => 
    $fetch<ApiPaginatedResponse<Comment>>(`/api/comments/${novelId}`, { 
      params: { page, limit }
    }),
  
  // Post a new comment
  postComment: (novelId: string, content: string, rating?: number) => 
    $fetch<CommentApiResponse<{ comment: Comment }>>(`/api/comments/post`, { 
      method: 'POST', 
      body: { novelId, content, rating } 
    }),
  
  // Reply to a comment
  replyComment: (parentCommentId: string, content: string, replyToUserId?: string) => 
    $fetch<CommentApiResponse<{ reply: Reply }>>(`/api/comments/reply`, { 
      method: 'POST', 
      body: { parentCommentId, content, replyToUserId } 
    }),

  // (Placeholder) Like a comment
  likeComment: (commentId: string) => 
    $fetch<CommentApiResponse<{ comment: Comment }>>(`/api/comments/like/${commentId}`, { // Example endpoint
      method: 'POST' 
    }),

  // (Placeholder) Like a reply
  likeReply: (replyId: string) => 
    $fetch<CommentApiResponse<{ reply: Reply }>>(`/api/comments/like/reply/${replyId}`, { // Example endpoint
      method: 'POST'
    }),
}; 