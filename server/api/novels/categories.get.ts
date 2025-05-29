import { defineEventHandler } from 'h3'
import { NovelModel } from '../../models/novel' // Adjust path if your model is located elsewhere

export default defineEventHandler(async (_event) => {
  try {
    // Fetch distinct categories.
    // Filter out null, undefined, or empty string categories directly in the query if possible,
    // or filter the result array.
    const categories = await NovelModel.distinct('category').exec();
    
    // Ensure categories are valid strings and not empty
    const validCategories = categories.filter(category => category && typeof category === 'string' && category.trim() !== '');

    return {
      status: 200,
      message: 'Categories fetched successfully.',
      data: validCategories.sort(), // Return sorted categories
    };
  } catch (error: unknown) {
    console.error('[API /novels/categories] Error fetching categories:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    // Consider using createError for proper error handling in Nuxt 3
    return {
      status: 500,
      message: 'Failed to fetch categories.',
      error: message,
      data: [],
    };
  }
}); 