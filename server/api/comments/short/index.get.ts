import { CommentModel } from '../../../models/Comment.model';
import { defineEventHandler, type H3Event, getQuery } from 'h3';
import { createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const novelId = query.novelId as string;

  if (!novelId) {
    // Using createError for proper Nuxt error handling
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: 'Novel ID is required' },
    });
  }

  try {
    const comments = await CommentModel.find({ novel: novelId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar _id') // Populate user info, added _id for consistency
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username avatar _id' }, // Populate user for replies
          { path: 'replyTo', select: 'username avatar _id' } // Populate replyTo user for replies
        ],
        options: { sort: { createdAt: 1 } } // Sort replies by creation date ascending
      })
      .lean();

    const totalComments = await CommentModel.countDocuments({ novel: novelId });

    return {
        comments,
        total: totalComments,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { message: 'Failed to fetch comments', details: errorMessage },
    });
  }
}); 