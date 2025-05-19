import mongoose, { type Types } from 'mongoose'

export interface IBookmark extends mongoose.Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  novelId: Types.ObjectId
  chapterId?: Types.ObjectId
  updatedAt: Date
  createdAt: Date
}

// 书签模式定义 - 用户的书架收藏
const bookmarkSchema = new mongoose.Schema<IBookmark>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  novelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Novel', 
    required: true 
  },
  chapterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chapter',
    default: null
  }
}, { timestamps: true })

// 创建复合索引
bookmarkSchema.index({ userId: 1, novelId: 1 }, { unique: true })

export const BookmarkModel = mongoose.model<IBookmark>('Bookmark', bookmarkSchema) 