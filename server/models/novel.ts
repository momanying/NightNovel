import mongoose from 'mongoose'

// 标签子模式
const TagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String }
})

// 小说模式
const NovelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['连载中', '已完结', '已停更'], default: '连载中' },
  lastUpdate: { type: String },
  cover_url: { type: String, required: true },
  source_site: { type: String },
  crawl_time: { type: String },
  word_count: { type: Number, default: 0 },
  tags: [TagSchema],
  animation: { type: Boolean, default: false },
  introduction: { type: String },
  volumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volume' }],
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true })

// 添加虚拟字段获取最新章节
NovelSchema.virtual('latestChapter').get(async function() {
  const Volume = mongoose.model('Volume')
  const Chapter = mongoose.model('Chapter')
  
  // 获取该小说的所有卷，按order排序
  const volumes = await Volume.find({ novelId: this._id }).sort({ order: -1 }).limit(1)
  if (!volumes || volumes.length === 0) return null
  
  // 获取最新卷的最新章节
  const latestChapter = await Chapter.findOne({ 
    volumeId: volumes[0]._id
  }).sort({ order: -1 }).limit(1)
  
  return latestChapter
})

// 创建索引
NovelSchema.index({ title: 'text', author: 'text', introduction: 'text' })
NovelSchema.index({ category: 1 })
NovelSchema.index({ 'tags.name': 1 })

export const Novel = mongoose.model('Novel', NovelSchema) 