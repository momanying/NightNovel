import { UserModel } from "~/server/models"
import { generateToken } from "./jwt"
import { validateInput } from '~/server/utils/validation'
import { createError } from 'h3'
import type { H3Error } from 'h3'

interface MongoError extends Error {
    code?: number;
    keyPattern?: {
        username?: boolean;
        email?: boolean;
    };
}

// 定义注册验证规则
const registerValidation = validateInput({
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    message: '用户名长度应在3-20个字符之间'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 20,
    message: '密码长度应在6-20个字符之间'
  }
})

export default defineEventHandler(async (event) => {
    try {
        // 应用验证中间件
        await registerValidation(event)
        
        const { username, email, password } = await readBody(event)

        // 验证用户名和邮箱是否已存在
        const existingUser = await UserModel.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${username}$`, 'i') } },
                { email: { $regex: new RegExp(`^${email}$`, 'i') } }
            ]
        })

        if (existingUser) {
            const field = existingUser.username.toLowerCase() === username.toLowerCase() ? '用户名' : '邮箱'
            throw createError({
                statusCode: 400,
                message: `${field}已被注册`
            })
        }

        // 创建新用户
        const user = new UserModel({
            username,
            email,
            password,
            avatar: `/images/default-cover.webp` // 设置默认头像
        })

        // 保存用户到数据库
        await user.save()

        // 生成token
        const token = generateToken(user._id.toString())

        return {
            code: 200,
            message: '注册成功',
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
    } catch (error: unknown) {
        console.error('注册失败:', error)
        
        // 处理MongoDB唯一索引错误
        if ((error as MongoError).code === 11000) {
            const field = (error as MongoError).keyPattern?.username ? '用户名' : '邮箱'
            throw createError({
                statusCode: 400,
                message: `${field}已被注册`
            })
        }

        // 处理验证错误
        if ((error as H3Error).statusCode === 400) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: '服务器错误，请稍后重试'
        })
    }
})

