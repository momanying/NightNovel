import { verifyToken } from '~/server/api/auth/jwt';
import { BookmarkModel } from '~/server/models';
import mongoose from 'mongoose';

export default defineEventHandler(async (event) => {
    try {
        const { novelId } = getQuery(event);

        if (!novelId || typeof novelId !== 'string') {
            throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { message: '无效的小说ID' } });
        }

        const authorization = event.headers.get('Authorization');
        if (!authorization) {
            // Not logged in, so not collected. This is not an error.
            return { isCollected: false };
        }

        const token = authorization.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            // Invalid token, but for this check, we can just return false.
            return { isCollected: false };
        }
        const userId = new mongoose.Types.ObjectId(decoded.id);

        const bookmark = await BookmarkModel.findOne({ userId, novelId }).lean();
        return { isCollected: !!bookmark };

    } catch (error) {
        const h3Error = error as { statusCode?: number };
        if (h3Error.statusCode) throw error;
        console.error('检查收藏状态失败:', error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', data: { message: '服务器内部错误' } });
    }
}); 