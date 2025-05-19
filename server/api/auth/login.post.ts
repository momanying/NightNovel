import { UserModel } from '~/server/models'
import { generateToken } from './jwt'
import { rateLimit } from '~/server/middleware/rateLimit'

// 定义限流规则（15分钟内最多5次失败尝试）
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
})

export default defineEventHandler(async (event) => {
  try {
    // 应用限流中间件
    const rateLimitResult = await loginRateLimit(event)
    if (rateLimitResult) return rateLimitResult

    const { username, password } = await readBody(event)

    // 查找用户
    const user = await UserModel.findOne({ username })
    if (!user) {
      return {
        code: 400,
        message: '用户不存在',
        data: null
      }
    }

    // 验证密码
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return {
        code: 400,
        message: '密码错误',
        data: null
      }
    }

    // 生成token
    const token = generateToken(user._id.toString())

    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    }
  } catch (error) {
    console.error('登录失败', error)
    return {
      code: 500,
      message: '服务器错误',
      data: null
    }
  }
})