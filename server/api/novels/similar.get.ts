import { defineEventHandler, getQuery } from 'h3'
import { NovelModel } from '../../models/novel'
import type mongoose from 'mongoose'
import type { Types, PipelineStage, FilterQuery } from 'mongoose'

// Define a local INovel interface for the fields used in this API
interface INovel extends mongoose.Document {
  _id: Types.ObjectId;
  title: string;
  author: string;
  cover_url: string;
  tags?: string;
  // Add other fields if they are accessed from novel object in this file
}

interface QueryParams {
  tags?: string; // Comma-separated tags from the detail novel
  // limit is now fixed to 5 internally
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
  const { tags: currentTagsString } = getQuery<QueryParams>(event);

  const internalLimit = 5;

  if (!currentTagsString) {
    return { status: 400, message: 'Tags are required.', data: [] };
  }

  const currentTags = currentTagsString.split(',').map(tag => tag.trim()).filter(tag => tag);

  if (currentTags.length < 2) {
    return { status: 400, message: 'At least two distinct tags are required.', data: [] };
  }

  const shuffledTags = shuffleArray([...currentTags]);
  const selectedQueryTags = [shuffledTags[0], shuffledTags[1]];

  try {
    // Modify to use $regex operator directly for more "fuzzy" matching (substring, case-insensitive)
    type TagCondition = { tags: { $regex: string, $options: string } };
    
    interface MatchConditions extends FilterQuery<INovel> {
      $and?: TagCondition[];
    }
    const matchConditions: MatchConditions = {};
    
    const tagAndConditions: TagCondition[] = [];
    selectedQueryTags.forEach(tag => {
      // Using $regex for substring matching, removing \b word boundaries for more fuzziness
      tagAndConditions.push({ tags: { $regex: escapeRegExp(tag), $options: 'i' } });
    });

    if (tagAndConditions.length === 2) {
        matchConditions.$and = tagAndConditions;
    } else {
        return { status: 500, message: 'Internal error forming tag conditions.', data: [] };
    }
    

    const pipeline: PipelineStage[] = [
        { $match: matchConditions }, 
        { $sample: { size: internalLimit } }
    ];

    const similarNovelsResults: INovel[] = await NovelModel.aggregate(pipeline).exec();

    const formattedNovels = similarNovelsResults.map(novel => ({
      id: novel._id.toString(),
      title: novel.title,
      author: novel.author,
      cover_url: novel.cover_url,
      tags: novel.tags,
    }));

    return {
      status: 200,
      message: 'Simplified/Fuzzy: Similar novels fetched (must contain both random tags substring).',
      data: formattedNovels,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { status: 500, message: 'Failed to fetch similar novels.', error: message, data: [] };
  }
}) 