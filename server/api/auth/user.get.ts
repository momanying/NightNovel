import { User } from '~/server/models/user'
import { verifyToken } from './jwt'

export default defineEventHandler(async (event) => {
  try {
    const authorization = event.headers.get('Authorization')
    if (!authorization) {
      return {
        code: 401,
        message: '未授权',
        data: null
      }
    }

    const token = authorization.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return {
        code: 404,
        message: '用户不存在',
        data: null
      }
    }

    return {
      code: 200,
      message: '获取用户信息成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    return {
      code: 401,
      message: '无效的token',
      data: null
    }
  }
})