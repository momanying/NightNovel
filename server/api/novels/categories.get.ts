import { defineEventHandler } from 'h3'
import { NovelModel } from '../../models/novel'

export default defineEventHandler(async (_event) => {
  try {
    const categories = await NovelModel.distinct('category').exec();
    
    const validCategories = categories.filter(category => category && typeof category === 'string' && category.trim() !== '');

    return {
      status: 200,
      message: 'Categories fetched successfully.',
      data: validCategories.sort(),
    };
  } catch (error: unknown) {
    console.error('[API /novels/categories] Error fetching categories:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      status: 500,
      message: 'Failed to fetch categories.',
      error: message,
      data: [],
    };
  }
}); 