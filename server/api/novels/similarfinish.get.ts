import { defineEventHandler, getQuery } from 'h3'
import { NovelModel } from '../../models/novel'
import mongoose from 'mongoose'
import type { Types, PipelineStage, FilterQuery } from 'mongoose'

// Define a local INovel interface for the fields used in this API
interface INovel extends mongoose.Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  cover_url: string;
  tags?: string;
  status?: string;
  // Add other fields if they are accessed from novel object in this file
}

interface QueryParams {
  tags?: string; // Comma-separated tags from the detail novel
  novelId?: string;
}

// Helper function to escape special characters for regex
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\\\]]/g, '\\$&'); // $& means the whole matched string
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  if (array.length <= 1) return array; // No need to shuffle if 0 or 1 element
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default defineEventHandler(async (event) => {
  const { tags: currentTagsString, novelId } = getQuery<QueryParams>(event);

  const internalLimit = 5;

  if (!currentTagsString) {
    return { status: 400, message: 'Tags are required for similar finished novels.', data: [] };
  }

  const currentTags = currentTagsString.split(',').map(tag => tag.trim()).filter(tag => tag);

  if (currentTags.length < 2) {
    return { status: 400, message: 'At least two distinct tags are required for similar finished novels.', data: [] };
  }

  const shuffledTags = shuffleArray([...currentTags]);
  const selectedQueryTags = [shuffledTags[0], shuffledTags[1]];

  try {
    type TagCondition = { tags: { $regex: string, $options: string } };
    type StatusCondition = { status: string }; // For the '已完结' status
    
    const matchConditions: FilterQuery<INovel> = {};

    if (novelId) {
      matchConditions._id = { $ne: new mongoose.Types.ObjectId(novelId) };
    }
    
    // Start with the status condition, then add tag conditions
    const queryConditions: (TagCondition | StatusCondition)[] = [
      { status: '已完结' } // Hardcoded status filter
    ];

    selectedQueryTags.forEach(tag => {
      queryConditions.push({ tags: { $regex: escapeRegExp(tag), $options: 'i' } });
    });

    // We expect 3 conditions: 1 for status, 2 for tags
    if (queryConditions.length >= 3) { 
        matchConditions.$and = queryConditions;
    } else {
        // This should not happen if currentTags.length >= 2 check passed
        console.error('[SimilarFinish API] Internal error: Not enough conditions formed.', queryConditions);
        return { status: 500, message: 'Internal error forming query conditions for similar finished novels.', data: [] };
    }
    
    // console.log('[SimilarFinish API] Constructed matchConditions:', matchConditions);

    const pipeline: PipelineStage[] = [
        { $match: matchConditions }, 
        { $sample: { size: internalLimit } } // Randomly sample 5 documents
    ];
        
    // console.log('[SimilarFinish API] Aggregation pipeline:', pipeline);

    const similarNovelsResults: INovel[] = await NovelModel.aggregate(pipeline).exec();
    // console.log(`[SimilarFinish API] Found ${similarNovelsResults.length} finished novels with similar tags.`);

    const formattedNovels = similarNovelsResults.map(novel => ({
      id: novel._id.toString(),
      title: novel.title,
      author: novel.author,
      cover_url: novel.cover_url,
      tags: novel.tags,
      status: novel.status, // Optionally include status in the response
    }));

    return {
      status: 200,
      message: 'Similar finished novels fetched (must contain both random tags and be finished).',
      data: formattedNovels,
    }
  } catch (error: unknown) {
    console.error('[SimilarFinish API] Error during processing:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { status: 500, message: 'Failed to fetch similar finished novels.', error: message, data: [] };
  }
}) 