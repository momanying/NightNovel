import { Schema, model, Types } from 'mongoose';

// Schema for Popular Comments with markdown content
const popularCommentSchema = new Schema({
  novel: { type: Types.ObjectId, ref: 'Novel', required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 10000 }, // Longer content for markdown
  htmlContent: { type: String }, // Optional pre-rendered HTML content
  rating: { type: Number, min: 1, max: 5, required: true },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  image: { type: String, default: null },
  isEdited: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: true }, // Flag to mark as popular
  featuredOrder: { type: Number, default: 0 }, // For manual ordering of featured comments
  tags: [{ type: String }], // Optional tags for categorization
}, { timestamps: true });

// Indexes for efficient querying
popularCommentSchema.index({ novel: 1, createdAt: -1 });
popularCommentSchema.index({ rating: -1, 'likes.length': -1 }); // For sorting by rating and popularity
popularCommentSchema.index({ isPopular: 1, featuredOrder: 1 }); // For featured comments

export const PopularCommentModel = model('PopularComment', popularCommentSchema); 