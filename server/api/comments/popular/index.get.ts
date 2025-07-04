import { PopularCommentModel } from '../../../models/PopularComment.model';
import { defineEventHandler, getQuery, type H3Event, createError } from 'h3';
import mongoose from 'mongoose';

interface PopularCommentDocument {
  _id: mongoose.Types.ObjectId;
  content: string;
  htmlContent?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: mongoose.Types.ObjectId;
    username: string;
    avatar?: string;
  };
  likes?: mongoose.Types.ObjectId[];
  images?: string[];
  tags?: string[];
  featuredOrder?: number;
  title?: string;
}

export default defineEventHandler(async (event: H3Event) => {
  const { novelId, id: commentId } = getQuery(event);

  try {
    if (commentId && typeof commentId === 'string' && mongoose.Types.ObjectId.isValid(commentId)) {
      const comment = await PopularCommentModel.findById(commentId)
        .populate('user', 'username avatar _id')
        .lean() as unknown as PopularCommentDocument;

      if (!comment) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          data: { message: 'Comment not found' },
        });
      }
      
      const user = comment.user || { _id: undefined, username: '', avatar: '' };
      const transformedComment = {
        _id: comment._id?.toString() || '',
        title: comment.title || '',
        content: comment.content || '',
        htmlContent: comment.htmlContent || '',
        rating: comment.rating || 0,
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
        user: {
          _id: user._id?.toString() || '',
          username: user.username,
          avatar: user.avatar
        },
        likesCount: comment.likes?.length || 0,
        images: comment.images || [],
        tags: comment.tags || []
      };

      return { comment: transformedComment };
    }

    // Base query to find popular comments
    const queryConditions: Record<string, mongoose.Types.ObjectId> = {};
    
    // If novelId is provided, filter by that novel
    if (novelId && typeof novelId === 'string') {
      if (mongoose.Types.ObjectId.isValid(novelId)) {
        queryConditions.novel = new mongoose.Types.ObjectId(novelId);
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: { message: 'Invalid novel ID format' },
        });
      }
    }
    
    // First try to find from dedicated PopularComment model
    const popularComments = await PopularCommentModel.find(queryConditions)
      .sort({ 
        featuredOrder: 1, // First sort by manual featured order
        rating: -1,       // Then by rating
        'likes.length': -1 // Then by most likes
      })
      .populate('user', 'username avatar _id')
      .lean() as unknown as PopularCommentDocument[];

    // Transform the data for the frontend
    const transformedComments = popularComments.map((comment) => {
      // Ensure we have valid data even if some fields are missing
      const user = comment.user || { _id: undefined, username: '', avatar: '' };
      
      return {
        _id: comment._id?.toString() || '',
        content: comment.content || '',
        htmlContent: comment.htmlContent || '',
        rating: comment.rating || 0,
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
        user: {
          _id: user._id?.toString() || '',
          username: user.username,
          avatar: user.avatar
        },
        likesCount: comment.likes?.length || 0,
        images: comment.images || [],
        tags: comment.tags || [],
        title: comment.title || ''
      };
    });

    return { comments: transformedComments };
  } catch (error) {
    console.error('Error fetching popular comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { message: 'Failed to fetch popular comments', details: errorMessage },
    });
  }
}); 