import mongoose from 'mongoose'

const VolumeSchema = new mongoose.Schema({
  novelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Novel', 
    required: true 
  },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  chapters: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chapter' 
  }]
}, { timestamps: true })

// 创建索引
VolumeSchema.index({ novelId: 1 })
VolumeSchema.index({ novelId: 1, order: 1 })

export const Volume = mongoose.model('Volume', VolumeSchema) 