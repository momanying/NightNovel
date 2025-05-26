import { CommentModel } from '../../models/Comment.model';
import { ReplyModel } from '../../models/Reply.model';
import { defineEventHandler, readBody, type H3Event, createError } from 'h3';
import type { Reply as ReplyType } from '../../../types/comment';
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

    if (replyToObjectId) {
      // const userToReplyToExists = await mongoose.model('User').findById(replyToObjectId).lean();
      // if (!userToReplyToExists) throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'User to reply to not found.' } });
    }

    const replyDocument = new ReplyModel({
      parentComment: parentCommentId, // ObjectId instance
      user: userId,                // ObjectId instance
      content,
      replyTo: replyToObjectId,    // ObjectId instance or undefined
    });

    await replyDocument.save();

    parentComment.replies.push(replyDocument._id as unknown as Types.ObjectId);
    await parentComment.save();
    
    const populatedReply = await ReplyModel.findById(replyDocument._id)
      .populate('user', 'username avatar _id')
      .populate('replyTo', 'username avatar _id') // Populate if replyToUserId was provided
      .lean<ReplyType>();

    if (!populatedReply) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Reply created but could not be retrieved.' } });
    }

    // Match the expected CommentApiResponse structure { data: { reply: ... } }
    return { data: { reply: populatedReply } };

  } catch (error) {
    const typedError = error as (Error & { code?: number; errmsg?: string });
    console.error('Error posting reply:', typedError.message, typedError.stack);
    const errorMessage = typedError.message || 'An unknown error occurred while posting the reply.';
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: { message: 'Failed to post reply.', details: errorMessage } });
  }
}); 