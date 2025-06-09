import { promises as fs } from 'fs';
import { join } from 'path';
import { defineEventHandler, readMultipartFormData } from 'h3';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = './public/uploads/comments';

export default defineEventHandler(async (event) => {
  try {
    // Ensure the upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    
    const multipart = await readMultipartFormData(event);
    const uploadedUrls: string[] = [];

    if (multipart) {
      for (const file of multipart) {
        if (file.filename && file.data) {
          const extension = file.filename.split('.').pop() || 'tmp';
          const newFileName = `${nanoid()}.${extension}`;
          const filePath = join(UPLOAD_DIR, newFileName);
          
          await fs.writeFile(filePath, file.data);
          
          // Construct the public URL
          const publicUrl = `/uploads/comments/${newFileName}`;
          uploadedUrls.push(publicUrl);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      // Set status to 400 Bad Request if no files were uploaded
      event.node.res.statusCode = 400;
      return {
        error: 'No files uploaded.',
      };
    }

    return uploadedUrls;
  } catch (error) {
    console.error('File upload error:', error);
    
    // Set status to 500 Internal Server Error
    event.node.res.statusCode = 500;
    return {
      error: 'An error occurred during file upload.',
    };
  }
}); 