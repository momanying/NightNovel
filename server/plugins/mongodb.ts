import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const MONGODB_URI = config.mongodbUri || 'mongodb://localhost:27017/nightnovel'

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI)
      console.log('✅ MongoDB connected')
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
    })

    // 添加关闭钩子，优雅断开 MongoDB 连接
    nitroApp.hooks.hook('close', async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect()
        console.log('🔌 MongoDB disconnected on Nitro app close')
      }
    })

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error)
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1)
    }
  }
})
