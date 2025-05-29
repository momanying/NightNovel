import { defineEventHandler, readBody } from 'h3';
import bcrypt from 'bcryptjs';
import { UserModel } from '~/server/models/user'; // Corrected import

export default defineEventHandler(async (event) => {
  const { oldPassword, newPassword } = await readBody(event);

  if (!oldPassword || !newPassword) {
    event.node.res.statusCode = 400;
    return { success: false, message: '当前密码和新密码均为必填项。' };
  }

  if (newPassword.length < 6) {
    event.node.res.statusCode = 400;
    return { success: false, message: '新密码长度至少需要6位。' };
  }

  // Assuming you have userId in event.context.auth or similar from your auth middleware
  const userId = event.context.auth?.userId || event.context.auth?.user?._id;
  if (!userId) {
    event.node.res.statusCode = 401;
    return { success: false, message: '用户未授权或会话已过期。' };
  }

  try {
    const user = await UserModel.findById(userId).select('+password'); // Ensure password field is selected
    if (!user) {
      event.node.res.statusCode = 404;
      return { success: false, message: '未找到用户。' };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      event.node.res.statusCode = 400;
      return { success: false, message: '当前密码不正确。' };
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: '密码已成功更新。' };

  } catch (error) {
    console.error('Error changing password:', error);
    event.node.res.statusCode = 500;
    return { success: false, message: '服务器内部错误，无法更新密码。' };
  }
}); 