import { User } from '~/server/models/user'
import { verifyToken, generateToken } from './jwt'

export default defineEventHandler(async (event) => {
  try {
    const { refreshToken } = await readBody(event)

    if (!refreshToken) {
      return {
        code: 400,
        message: '缺少刷新令牌',
        data: null
      }
    }

    // 验证刷新令牌
    const decoded = verifyToken(refreshToken)
    const user = await User.findById(decoded.id)

    if (!user) {
      return {
        code: 401,
        message: '用户不存在',
        data: null
      }
    }

    // 生成新的访问令牌
    const newAccessToken = generateToken(user._id.toString())

    return {
      code: 200,
      message: '令牌刷新成功',
      data: {
        token: newAccessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    }
  } catch (error) {
    console.error('令牌刷新失败', error)
    return {
      code: 401,
      message: '无效的刷新令牌',
      data: null
    }
  }
}) 