import { verifyToken } from './jwt'

export default defineEventHandler(async (event) => {
  try {
    // 获取Authorization头
    const authorization = event.headers.get('Authorization')
    if (!authorization) {
      return {
        code: 401,
        message: '未登录',
        data: null
      }
    }

    // 验证token
    try {
      const token = authorization.replace('Bearer ', '')
      const decoded = verifyToken(token)
      
      if (!decoded || !decoded.id) {
        return {
          code: 401,
          message: '无效的token',
          data: null
        }
      }
      
      // 在JWT认证系统中，退出登录主要由客户端处理（删除本地存储的token）
      // 服务端不需要额外操作，因为JWT是无状态的
      
      return {
        code: 200,
        message: '退出登录成功',
        data: null
      }
    } catch {
      return {
        code: 401,
        message: '无效的token',
        data: null
      }
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : '未知错误'
    console.error('退出登录失败:', errMsg)
    return {
      code: 500,
      message: '服务器错误',
      error: errMsg
    }
  }
}) 