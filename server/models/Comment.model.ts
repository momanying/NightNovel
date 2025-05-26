import { Schema, model, Types } from 'mongoose';

const commentSchema = new Schema({
  novel: { type: Types.ObjectId, ref: 'Novel', required: true }, // Assuming a Novel model
  user: { type: Types.ObjectId, ref: 'User', required: true },   // Assuming a User model
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5 },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  replies: [{ type: Types.ObjectId, ref: 'Reply' }],
  isEdited: { type: Boolean, default: false },
  // isArchived / isHidden flags can be added for moderation
}, { timestamps: true });

// Optional: Compound index for fetching comments for a novel, sorted by creation date
commentSchema.index({ novel: 1, createdAt: -1 });

export const CommentModel = model('Comment', commentSchema); 