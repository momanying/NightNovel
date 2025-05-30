import { PopularCommentModel } from '../../../models/PopularComment.model';
import { defineEventHandler, readMultipartFormData, type H3Event, createError } from 'h3';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Assuming you have a way to get the authenticated user ID
const getAuthenticatedUserId = (event: H3Event): string | null => {
  const userId = event.context.auth?.user?._id;
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

  const multipartFormData = await readMultipartFormData(event);

  let novelIdString: string | undefined;
  let content: string | undefined;
  let htmlContent: string | undefined;
  let ratingString: string | undefined;
  let tagsString: string | undefined;
  let imageFile: Buffer | undefined;
  let imageFileName: string | undefined;

  if (multipartFormData) {
    for (const part of multipartFormData) {
      if (part.name === 'novelId') {
        novelIdString = part.data.toString();
      } else if (part.name === 'content') {
        content = part.data.toString();
      } else if (part.name === 'htmlContent') {
        htmlContent = part.data.toString();
      } else if (part.name === 'rating') {
        ratingString = part.data.toString();
      } else if (part.name === 'tags') {
        tagsString = part.data.toString();
      } else if (part.name === 'image' && part.filename) {
        imageFile = part.data;
        imageFileName = part.filename;
      }
    }
  }

  if (!novelIdString || !content) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      data: { message: 'Novel ID and content are required' } 
    });
  }

  if (!mongoose.Types.ObjectId.isValid(novelIdString)) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      data: { message: 'Invalid Novel ID format.' } 
    });
  }
  
  const novelId = new mongoose.Types.ObjectId(novelIdString);
  const rating = ratingString ? parseInt(ratingString, 10) : 5;
  const tags = tagsString ? JSON.parse(tagsString) : [];

  let imageUrl: string | undefined = undefined;

  if (imageFile && imageFileName) {
    try {
      const fileExtension = path.extname(imageFileName);
      const uniqueFileName = `${randomUUID()}${fileExtension}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'comments');
      const filePath = path.join(uploadsDir, uniqueFileName);

      await fs.mkdir(uploadsDir, { recursive: true }); // Ensure directory exists
      await fs.writeFile(filePath, imageFile);
      
      imageUrl = `/uploads/comments/${uniqueFileName}`; // URL relative to public directory
    } catch (uploadError) {
      console.error('Error saving uploaded image:', uploadError);
    }
  }

  try {
    const popularCommentDocument = new PopularCommentModel({
      novel: novelId,
      user: userId,   
      content,
      htmlContent,
      rating,
      image: imageUrl,
      tags,
      isPopular: true,
      featuredOrder: 0 // Default to lowest priority
    });

    await popularCommentDocument.save();
    
    // Repopulate to ensure all necessary fields are present for the client
    const populatedComment = await PopularCommentModel.findById(popularCommentDocument._id)
      .populate('user', 'username avatar _id')
      .lean();
    
    if (!populatedComment) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'Not Found', 
        data: { message: 'Comment created but could not be retrieved.' } 
      });
    }

    return {
      code: 200,
      message: '评论提交成功',
      data: { comment: populatedComment }
    };

  } catch (error: unknown) {
    console.error('Error posting popular comment:', error);
    
    const typedError = error as (Error & { code?: number; errmsg?: string });
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