import mongoose, {type Document } from 'mongoose'

// 定义章节接口
export interface IChapter extends Document {
  novelId: mongoose.Types.ObjectId;
  volumeId: mongoose.Types.ObjectId;
  title: string;
  order: number;
  content: string;
  word_count: number;
  source_url?: string;
  createdAt: Date;
  updatedAt: Date;
  getPrevAndNext(): Promise<{
    prevChapter: IChapter | null;
    nextChapter: IChapter | null;
  }>;
}

const ChapterSchema = new mongoose.Schema({
  novelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Novel', 
    required: true 
  },
  volumeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Volume', 
    required: true 
  },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  content: { type: String, required: true },
  word_count: { type: Number, default: 0 },
  source_url: { type: String }
}, { timestamps: true })

// 创建索引
ChapterSchema.index({ novelId: 1 })
ChapterSchema.index({ volumeId: 1 })
ChapterSchema.index({ volumeId: 1, order: 1 })

// 获取前一章和后一章的方法
ChapterSchema.methods.getPrevAndNext = async function() {
  const prevChapter = await this.model('Chapter').findOne({
    volumeId: this.volumeId,
    order: { $lt: this.order }
  }).sort({ order: -1 })

  const nextChapter = await this.model('Chapter').findOne({
    volumeId: this.volumeId,
    order: { $gt: this.order }
  }).sort({ order: 1 })

  return { prevChapter, nextChapter }
}

export const Chapter = mongoose.model('Chapter', ChapterSchema) 