import { CommentModel } from '../../../models/Comment.model';
import { defineEventHandler, type H3Event, getQuery } from 'h3';
import { createError } from 'h3';
import mongoose from 'mongoose';

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
    const novelObjectId = new mongoose.Types.ObjectId(novelId);

    const commentsPipeline: mongoose.PipelineStage[] = [
      { $match: { novel: novelObjectId } },
      { $sort: { createdAt: -1 } },
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
        $lookup: {
          from: 'replies',
          localField: 'replies',
          foreignField: '_id',
          as: 'replies',
          pipeline: [
            { $sort: { createdAt: 1 } },
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
              $lookup: {
                from: 'users',
                localField: 'replyTo',
                foreignField: '_id',
                as: 'replyToUser',
                pipeline: [{ $project: { username: 1, _id: 1 } }]
              }
            },
            { $unwind: { path: '$replyToUser', preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ];

    const comments = await CommentModel.aggregate(commentsPipeline);
    const totalComments = await CommentModel.countDocuments({ novel: novelId });

    return {
        comments,
        total: totalComments,
    };
  } catch (error) {
    console.error('Error fetching comments with aggregate:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { message: 'Failed to fetch comments', details: errorMessage },
    });
  }
}); 