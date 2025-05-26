import { CommentModel } from '../../models/Comment.model';
// import { ReplyModel } from '../../models/Reply.model'; // ReplyModel not directly used here for fetching top-level comments
import { defineEventHandler, getQuery, type H3Event } from 'h3';
import { createError } from 'h3';

export default defineEventHandler(async (event: H3Event) => {
  const novelId = event.context.params?.novelId;
  const { page = '1', limit = '10' } = getQuery(event);

  if (!novelId) {
    // Using createError for proper Nuxt error handling
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: 'Novel ID is required' },
    });
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: 'Invalid pagination parameters' },
    });
  }

  const skip = (pageNum - 1) * limitNum;

  try {
    const comments = await CommentModel.find({ novel: novelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
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
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalComments / limitNum),
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