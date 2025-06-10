import { Schema, model, Types } from 'mongoose';

const popularCommentSchema = new Schema({
  novel: { type: Types.ObjectId, ref: 'Novel', required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 10000 }, 
  htmlContent: { type: String }, 
  rating: { type: Number, min: 1, max: 5, required: true },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  image: { type: String, default: null },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  isEdited: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: true }, 
  featuredOrder: { type: Number, default: 0 }, 
  tags: [{ type: String }],
}, { timestamps: true });

popularCommentSchema.index({ novel: 1, createdAt: -1 });
popularCommentSchema.index({ rating: -1, 'likes.length': -1 }); 
popularCommentSchema.index({ isPopular: 1, featuredOrder: 1 });

export const PopularCommentModel = model('PopularComment', popularCommentSchema); 