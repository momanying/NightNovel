import { CommentModel } from '../../models/Comment.model';
import { defineEventHandler, readBody, type H3Event, createError } from 'h3';
import type { Comment as CommentType } from '../../../types/comment';
import mongoose from 'mongoose'; // Import mongoose to use Types.ObjectId

// Assuming you have a way to get the authenticated user ID
const getAuthenticatedUserId = (event: H3Event): string | null => {
  const userId = event.context.auth?.user?._id
  return userId;
};

export default defineEventHandler(async (event: H3Event) => {
  const userIdString = getAuthenticatedUserId(event);

  if (!userIdString || !mongoose.Types.ObjectId.isValid(userIdString)) {
    console.error('Authentication Error: User ID is invalid or not provided.', userIdString);
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { message: 'User authentication required or invalid user ID format.' }
    });
  }
  const userId = new mongoose.Types.ObjectId(userIdString);

  const body = await readBody(event);
  const { novelId: novelIdString, content, rating } = body as { novelId: string; content: string; rating?: number };

  if (!novelIdString || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Novel ID and content are required' } });
  }

  if (!mongoose.Types.ObjectId.isValid(novelIdString)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Invalid Novel ID format.' } });
  }
  const novelId = new mongoose.Types.ObjectId(novelIdString);

  if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
     throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Invalid rating. Must be a number between 1 and 5.' } });
  }

  try {
    // Optional: Check if novel and user exist before creating comment
    // const novelExists = await mongoose.model('Novel').findById(novelId).lean();
    // if (!novelExists) throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Novel not found.' } });
    // const userExists = await mongoose.model('User').findById(userId).lean();
    // if (!userExists) throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'User not found.' } });

    const commentDocument = new CommentModel({
      novel: novelId, // Use the ObjectId instance
      user: userId,   // Use the ObjectId instance
      content,
      rating: rating,
    });

    await commentDocument.save();
    
    const populatedComment = await CommentModel.findById(commentDocument._id)
                                  .populate('user', 'username avatar _id')
                                  .lean<CommentType>();
    
    if (!populatedComment) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Comment created but could not be retrieved.' } });
    }

    // Match the expected CommentApiResponse structure { data: { comment: ... } }
    return { data: { comment: populatedComment } };

  } catch (error) {
    const typedError = error as (Error & { code?: number; errmsg?: string }); // More specific error typing for Mongoose/DB errors
    console.error('Error posting comment:', typedError.message, typedError.stack);
    let errorMessage = typedError.message || 'An unknown error occurred while posting the comment.';
    // Check for Mongoose duplicate key error
    if (typedError.code === 11000) {
        errorMessage = 'A similar comment might already exist. Please check and try again.';
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { message: 'Failed to post comment.', details: errorMessage }
    });
  }
}); 