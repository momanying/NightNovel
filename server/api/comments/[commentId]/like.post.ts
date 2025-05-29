import { CommentModel } from '../../../models/Comment.model';
import { defineEventHandler, type H3Event, createError } from 'h3';
import mongoose from 'mongoose';

const getAuthenticatedUserId = (event: H3Event): mongoose.Types.ObjectId | null => {
  const userIdString = event.context.auth?.user?._id;
  if (userIdString && mongoose.Types.ObjectId.isValid(userIdString)) {
    return new mongoose.Types.ObjectId(userIdString);
  }
  return null;
};

export default defineEventHandler(async (event: H3Event) => {
  const userId = getAuthenticatedUserId(event);

  if (!userId) {
    console.error('Authentication Error: User ID is invalid or not provided.');
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { message: '用户认证失败，请登录后再试。' },
    });
  }

  const commentIdString = event.context.params?.commentId;

  if (!commentIdString || !mongoose.Types.ObjectId.isValid(commentIdString)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: '无效的评论ID格式。' },
    });
  }
  const commentId = new mongoose.Types.ObjectId(commentIdString);

  try {
    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: { message: '评论不存在。' },
      });
    }

    const alreadyLiked = comment.likes.some((id => id.toString() === userId.toString()));
    
    let updateOperation;
    if (alreadyLiked) {
      updateOperation = { $pull: { likes: userId } };
    } else {
      updateOperation = { $addToSet: { likes: userId } };
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      updateOperation,
      { new: true }
    )
    .populate('user')
    .populate({
      path: 'replies',
      populate: [
        { path: 'user', select: 'username avatar _id' },
        { path: 'replyTo', select: 'username avatar _id' }
      ],
      options: { sort: { createdAt: 1 } }
    });
    
    if (!updatedComment) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            data: { message: '更新评论失败，评论可能已被删除。'},
        });
    }

    return {
      success: true,
      message: alreadyLiked ? '取消点赞成功！' : '点赞成功！',
      data: { comment: updatedComment },
    };

  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    
    let errorMessage = '处理点赞请求时发生服务器内部错误。';
    let statusCode = 500;
    let statusMessage = 'Internal Server Error';

    if (error instanceof mongoose.Error.CastError) {
      errorMessage = '提供的ID格式不正确。';
      statusCode = 400;
      statusMessage = 'Bad Request';
    } else if (typeof error === 'object' && error !== null) {
      if ('statusCode' in error && typeof error.statusCode === 'number') {
        statusCode = error.statusCode;
      }
      if ('statusMessage' in error && typeof error.statusMessage === 'string') {
        statusMessage = error.statusMessage;
      }
      
      if ('data' in error && 
          typeof error.data === 'object' && 
          error.data !== null && 
          'message' in error.data && 
          typeof (error.data as { message?: string }).message === 'string') {
        errorMessage = (error.data as { message: string }).message;
      } else if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) { // Fallback for standard Error objects
        errorMessage = error.message;
    }

    throw createError({
      statusCode,
      statusMessage,
      data: { message: errorMessage },
    });
  }
}); 



