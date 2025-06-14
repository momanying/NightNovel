import { CommentModel } from '../../../models/Comment.model';
import { ReplyModel } from '../../../models/Reply.model';
import { defineEventHandler, readBody, type H3Event, createError } from 'h3';
import mongoose, { type Types } from 'mongoose';

const getAuthenticatedUserId = (event: H3Event): string | null => {
  const userId = event.context.auth?.user?._id
  return userId;
};

export default defineEventHandler(async (event: H3Event) => {
  const userIdString = getAuthenticatedUserId(event);

  if (!userIdString || !mongoose.Types.ObjectId.isValid(userIdString)) {
    console.error('Authentication Error: User ID is invalid or not provided for reply.', userIdString);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { message: 'User authentication required or invalid user ID format.' } });
  }
  const userId = new mongoose.Types.ObjectId(userIdString);

  const body = await readBody(event);
  const { parentCommentId: parentCommentIdString, content, replyToUserId: replyToUserIdString } = body as { parentCommentId: string; content: string; replyToUserId?: string };

  if (!parentCommentIdString || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Parent Comment ID and content are required for reply.' } });
  }

  if (!mongoose.Types.ObjectId.isValid(parentCommentIdString)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Invalid Parent Comment ID format for reply.' } });
  }
  const parentCommentId = new mongoose.Types.ObjectId(parentCommentIdString);

  let replyToObjectId: Types.ObjectId | undefined = undefined;
  if (replyToUserIdString) {
    if (!mongoose.Types.ObjectId.isValid(replyToUserIdString)) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Invalid replyToUser ID format for reply.' } });
    }
    replyToObjectId = new mongoose.Types.ObjectId(replyToUserIdString);
  }

  try {
    const parentComment = await CommentModel.findById(parentCommentId);
    if (!parentComment) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Parent comment not found for reply.' } });
    }

    const replyDocument = new ReplyModel({
      parentComment: parentCommentId,
      user: userId,
      content,
      replyTo: replyToObjectId,
    });

    await replyDocument.save();

    parentComment.replies.push(replyDocument._id as unknown as Types.ObjectId);
    await parentComment.save();
    
    // 使用聚合管道查询来确保我们能正确处理replyToUser
    const populatedReplies = await ReplyModel.aggregate([
      { $match: { _id: replyDocument._id } },
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

    if (!populatedReplies || populatedReplies.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Reply created but could not be retrieved.' } });
    }

    return { data: { reply: populatedReplies[0] } };

  } catch (error) {
    const typedError = error as (Error & { code?: number; errmsg?: string });
    console.error('Error posting reply:', typedError.message, typedError.stack);
    const errorMessage = typedError.message || 'An unknown error occurred while posting the reply.';
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: { message: 'Failed to post reply.', details: errorMessage } });
  }
}); 