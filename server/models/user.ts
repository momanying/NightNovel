import mongoose, { type Types } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends mongoose.Document {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  avatar: string
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'avatar.png' },
  createdAt: { type: Date, default: Date.now }
})

// 密码加密中间件
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// 实例方法定义
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
