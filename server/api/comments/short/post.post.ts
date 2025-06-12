import { CommentModel } from '../../../models/Comment.model';
import { defineEventHandler, readMultipartFormData, type H3Event, createError } from 'h3';
import type { Comment as CommentType } from '../../../../types/comment/short';
import mongoose from 'mongoose'; // Import mongoose to use Types.ObjectId
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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

  const multipartFormData = await readMultipartFormData(event);

  let novelIdString: string | undefined;
  let content: string | undefined;
  let ratingString: string | undefined;
  let imageFile: Buffer | undefined;
  let imageFileName: string | undefined;
  // let imageFileType: string | undefined; // We might not strictly need this for basic saving

  if (multipartFormData) {
    for (const part of multipartFormData) {
      if (part.name === 'novelId') {
        novelIdString = part.data.toString();
      } else if (part.name === 'content') {
        content = part.data.toString();
      } else if (part.name === 'rating') {
        ratingString = part.data.toString();
      } else if (part.name === 'image' && part.filename) {
        imageFile = part.data;
        imageFileName = part.filename;
        // imageFileType = part.type; // Store if needed for more advanced validation
      }
    }
  }

  if (!novelIdString || !content) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Novel ID and content are required' } });
  }

  if (!mongoose.Types.ObjectId.isValid(novelIdString)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: 'Invalid Novel ID format.' } });
  }
  const novelId = new mongoose.Types.ObjectId(novelIdString);
  const rating = ratingString ? parseInt(ratingString, 10) : undefined;

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
      // Decide if this should be a fatal error or if comment can be saved without image
      // For now, we'll proceed without image if upload fails
      // You might want to throw createError here in a real application
    }
  }

  try {
    const commentDocument = new CommentModel({
      novel: novelId,
      user: userId,   
      content,
      rating: rating,
      image: imageUrl, // Save the image URL
    });

    await commentDocument.save();
    
    // Repopulate to ensure all necessary fields are present for the client
    const populatedComment = await CommentModel.findById(commentDocument._id)
                                  .populate('user', 'username avatar _id')
                                  .populate({
                                    path: 'replies',
                                    populate: [
                                      { path: 'user', select: 'username avatar _id' },
                                      { path: 'replyTo', select: 'username avatar _id' }
                                    ],
                                    options: { sort: { createdAt: 1 } }
                                  })
                                  .lean<CommentType>();
    
    if (!populatedComment) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found', data: { message: 'Comment created but could not be retrieved.' } });
    }

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