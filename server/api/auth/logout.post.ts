export default defineEventHandler(async (_event) => {
  try {
    // 这里可以添加token黑名单逻辑
    // 如果使用Redis，可以将token加入黑名单并设置过期时间

    return {
      code: 200,
      message: '登出成功',
      data: null
    }
  } catch (error) {
    console.error('登出失败', error)
    return {
      code: 500,
      message: '服务器错误',
      data: null
    }
  }
}) 