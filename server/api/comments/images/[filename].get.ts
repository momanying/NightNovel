import { defineEventHandler } from 'h3'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const filename = event.context.params?.filename
  
  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing filename parameter'
    })
  }

  // 安全检查：防止路径遍历攻击
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid filename'
    })
  }

  const imagePath = join(process.cwd(), 'storage', 'shortcomment', filename)
  
  try {
    const fileBuffer = await readFile(imagePath)
    
    // 根据文件扩展名设置正确的Content-Type
    let contentType = 'image/jpeg' // 默认
    if (filename.endsWith('.png')) contentType = 'image/png'
    else if (filename.endsWith('.gif')) contentType = 'image/gif'
    else if (filename.endsWith('.webp')) contentType = 'image/webp'
    
    // 设置响应头
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000') // 缓存一年
    
    return fileBuffer
  } catch (error) {
    console.error(`Error serving comment image ${filename}:`, error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment image not found'
    })
  }
}) 