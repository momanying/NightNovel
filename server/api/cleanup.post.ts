import { defineEventHandler } from 'h3';
import { promises as fs } from 'fs';
import { resolve, join } from 'path';

const TEMP_DIR = resolve('./public/uploads/temp');
const MAX_AGE_HOURS = 24;

export default defineEventHandler(async (event) => {
  // Simple security check (you should use a more robust secret from your config)
  const secret = process.env.CLEANUP_SECRET;
  const providedSecret = event.headers.get('x-cleanup-secret');

  if (!secret || secret !== providedSecret) {
    event.node.res.statusCode = 401;
    return { error: 'Unauthorized' };
  }

  console.log('Running cleanup job for temporary upload files...');

  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = join(TEMP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        const fileAgeHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

        if (fileAgeHours > MAX_AGE_HOURS) {
          await fs.unlink(filePath);
          console.log(`Deleted old temp file: ${file}`);
          deletedCount++;
        }
      } catch (statError) {
        console.error(`Could not process file ${file}:`, statError);
      }
    }

    const message = `Cleanup job finished. Deleted ${deletedCount} file(s).`;
    console.log(message);
    return { success: true, message };

  } catch (error) {
    // Handle case where TEMP_DIR might not exist
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      const message = 'Temporary directory not found, nothing to clean up.';
      console.log(message);
      return { success: true, message };
    }
    
    console.error('Error during cleanup job:', error);
    event.node.res.statusCode = 500;
    return { error: 'Cleanup job failed.' };
  }
}); 