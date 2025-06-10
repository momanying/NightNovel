import { verifyToken } from '~/server/api/auth/jwt'
import { BookmarkModel, NovelModel } from '~/server/models'
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
  try {
    const authorization = event.headers.get('Authorization')
    if (!authorization) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: { message: '请先登录' }
      });
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || !decoded.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        data: { message: '无效的凭证' }
      });
    }
    const userId = new mongoose.Types.ObjectId(decoded.id);

    const body = await readBody(event)
    const { novelId, chapterId } = body

    if (!novelId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: { message: '无效的小说ID' }
      });
    }

    const novel = await NovelModel.findById(novelId).lean();
    if (!novel) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        data: { message: '小说不存在' }
      });
    }

    const bookmark = await BookmarkModel.findOneAndUpdate(
        { userId, novelId },
        { $set: { chapterId: chapterId || null }, $setOnInsert: { userId, novelId } },
        { upsert: true, new: true, runValidators: true }
    );

    return {
      code: 200,
      message: '添加成功',
      data: { bookmarkId: bookmark._id }
    }
  } catch (error: unknown) {
    console.error('添加书架失败:', error)
    
    if (error instanceof Error && 'statusCode' in error) {
        throw error;
    }
    
    throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { message: '服务器内部错误' }
    });
  }
}) 