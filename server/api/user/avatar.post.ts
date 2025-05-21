import { defineEventHandler, readMultipartFormData } from 'h3'
import fs from 'node:fs/promises'
import path from 'node:path'
import { UserModel } from '~/server/models/user' // Adjusted path based on typical Nuxt structure

export default defineEventHandler(async (event) => {
  // This assumes you have authentication middleware that populates `event.context.auth.user`
  // You'll need to adapt this to your actual authentication setup.
  const userId = event.context.auth?.user?._id 

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. User ID not found.',
    })
  }

  const formData = await readMultipartFormData(event)
  const filePart = formData?.find(part => part.name === 'avatar')

  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Avatar file is missing or invalid.',
    })
  }

  // Basic validation for image type (can be expanded)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(filePart.type!)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.',
    })
  }

  // Max file size (e.g., 5MB)
  const MAX_SIZE = 5 * 1024 * 1024 
  if (filePart.data.length > MAX_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: `File is too large. Max size is ${MAX_SIZE / (1024 * 1024)}MB.`,
    })
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
  // Ensure the directory exists
  try {
    await fs.mkdir(uploadsDir, { recursive: true })
  } catch (error) {
    console.error('Failed to create uploads directory:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error: Could not create upload directory.',
    })
  }
  
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const fileExtension = path.extname(filePart.filename)
  const newFilename = `avatar-${userId}-${uniqueSuffix}${fileExtension}`
  const filePath = path.join(uploadsDir, newFilename)
  const publicPath = `/uploads/avatars/${newFilename}`

  try {
    await fs.writeFile(filePath, filePart.data)
  } catch (error) {
    console.error('Failed to save avatar file:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error: Could not save avatar.',
    })
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { avatar: publicPath },
      { new: true }
    )

    if (!updatedUser) {
      // Attempt to clean up uploaded file if user update fails
      try { await fs.unlink(filePath) } catch (cleanupError) { console.error("Failed to cleanup orphaned avatar:", cleanupError)}
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found for avatar update.',
      })
    }

    return {
      success: true,
      message: 'Avatar uploaded successfully!',
      avatarUrl: publicPath,
    }
  } catch (error) {
    // Attempt to clean up uploaded file if DB update fails
    try { await fs.unlink(filePath) } catch (cleanupError) { console.error("Failed to cleanup orphaned avatar on DB error:", cleanupError)}
    console.error('Failed to update user avatar in DB:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Server error: Could not update user avatar.',
    })
  }
}) 