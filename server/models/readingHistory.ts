import mongoose, { type Types } from 'mongoose'

export interface IReadingHistory extends mongoose.Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  novelId: Types.ObjectId
  chapterId: Types.ObjectId
  readAt: Date
  updatedAt: Date
  createdAt: Date
}

// 阅读历史模式定义
const readingHistorySchema = new mongoose.Schema<IReadingHistory>({
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
    required: true
  },
  readAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true })

// 创建索引
readingHistorySchema.index({ userId: 1, novelId: 1, chapterId: 1 }, { unique: true })
readingHistorySchema.index({ userId: 1, readAt: -1 })

export const ReadingHistoryModel = mongoose.model<IReadingHistory>('ReadingHistory', readingHistorySchema) 