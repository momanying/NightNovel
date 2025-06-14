import { ReplyModel } from '../../../models/Reply.model';
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

  const replyIdString = event.context.params?.replyId;

  if (!replyIdString || !mongoose.Types.ObjectId.isValid(replyIdString)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: '无效的回复ID格式。' },
    });
  }
  const replyId = new mongoose.Types.ObjectId(replyIdString);

  try {
    const reply = await ReplyModel.findById(replyId);

    if (!reply) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: { message: '回复不存在。' },
      });
    }

    const alreadyLiked = reply.likes.some(id => id.toString() === userId.toString());
    
    let updateOperation;
    if (alreadyLiked) {
      updateOperation = { $pull: { likes: userId } };
    } else {
      updateOperation = { $addToSet: { likes: userId } };
    }

    // 使用聚合管道查询来确保我们能正确处理replyToUser
    const updatedReply = await ReplyModel.aggregate([
      { $match: { _id: replyId } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { username: 1, avatar: 1, _id: 1 } }]
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          replyTo: { $ifNull: ['$replyTo', null] }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { replyToId: '$replyTo' },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $ne: ['$$replyToId', null] },
                    { $eq: ['$_id', '$$replyToId'] }
                  ]
                } 
              }
            },
            { $project: { username: 1, _id: 1 } }
          ],
          as: 'replyToUser'
        }
      },
      {
        $addFields: {
          replyToUser: {
            $cond: {
              if: { $gt: [{ $size: '$replyToUser' }, 0] },
              then: { $arrayElemAt: ['$replyToUser', 0] },
              else: null
            }
          }
        }
      }
    ]);

    // 应用点赞/取消点赞操作
    await ReplyModel.updateOne(
      { _id: replyId },
      updateOperation
    );

    if (!updatedReply || updatedReply.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: { message: '更新回复失败，回复可能已被删除。'},
      });
    }

    // 更新点赞数组
    const finalReply = updatedReply[0];
    if (alreadyLiked) {
      finalReply.likes = finalReply.likes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId.toString());
    } else {
      finalReply.likes.push(userId);
    }

    return {
      success: true,
      message: alreadyLiked ? '取消点赞成功！' : '点赞成功！',
      data: { reply: finalReply },
    };

  } catch (error) {
    console.error('Error liking/unliking reply:', error);
    
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



