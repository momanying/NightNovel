import { Schema, model, Types } from 'mongoose';

const replySchema = new Schema({
  parentComment: { type: Types.ObjectId, ref: 'Comment', required: true },
  user: { type: Types.ObjectId, ref: 'User', required: true }, // Assuming a User model
  content: { type: String, required: true, trim: true, maxlength: 1000 },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  replyTo: { type: Types.ObjectId, ref: 'User' }, // User being replied to
  isEdited: { type: Boolean, default: false },
}, { timestamps: true });

export const ReplyModel = model('Reply', replySchema); 