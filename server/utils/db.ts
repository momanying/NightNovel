import mongoose from 'mongoose'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const uri = config.mongodbUri

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(uri)
}
