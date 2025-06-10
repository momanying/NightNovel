import { PopularCommentModel } from '../../../models/PopularComment.model';
import { defineEventHandler, readMultipartFormData, type H3Event, createError } from 'h3';
import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

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
  let title: string | undefined;
  let imagesString: string | undefined;

  if (multipartFormData) {
    for (const part of multipartFormData) {
      const partName = part.name;
      const partData = part.data.toString();

      switch (partName) {
        case 'novelId':
          novelIdString = partData;
          break;
        case 'content':
          content = partData;
          break;
        case 'htmlContent':
          htmlContent = partData;
          break;
        case 'rating':
          ratingString = partData;
          break;
        case 'tags':
          tagsString = partData;
          break;
        case 'title':
          title = partData;
          break;
        case 'images':
          imagesString = partData;
          break;
      }
    }
  }

  if (!novelIdString || !content || !title) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Bad Request', 
      data: { message: 'Novel ID, title, and content are required' } 
    });
  }

  if (title.length > 40) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { message: 'Title cannot be longer than 40 characters.' }
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
  let images = imagesString ? JSON.parse(imagesString) : [];

  let finalContent = content;

  // --- Image Handling Logic ---
  if (images.length > 0) {
    const TEMP_DIR = './public/uploads/temp';
    const PERMANENT_DIR = './public/uploads/comments';
    await fs.mkdir(PERMANENT_DIR, { recursive: true });

    const processedImageUrls: string[] = [];

    for (const tempUrl of images) {
      const fileName = basename(tempUrl);
      const tempPath = join(TEMP_DIR, fileName);
      const permanentPath = join(PERMANENT_DIR, fileName);

      try {
        // Check if file exists in temp and move it
        await fs.rename(tempPath, permanentPath);
        
        const permanentUrl = `/uploads/comments/${fileName}`;
        processedImageUrls.push(permanentUrl);
        
        // Update the URL in the content
        if(finalContent) {
          finalContent = finalContent.replace(tempUrl, permanentUrl);
        }

      } catch (moveError) {
        console.error(`Failed to move image ${fileName}:`, moveError);
        // Depending on desired behavior, you could either skip this image
        // or throw an error to halt the entire comment submission.
        // For now, we will skip it and not include it in the final comment.
      }
    }
    // Update the images array with the new, permanent URLs
    images = processedImageUrls;
  }
  // --- End Image Handling ---

  try {
    const popularCommentDocument = new PopularCommentModel({
      novel: novelId,
      user: userId,   
      title,
      content: finalContent,
      htmlContent,
      rating,
      images,
      tags,
      isPopular: true,
      featuredOrder: 0
    });

    await popularCommentDocument.save();
    
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