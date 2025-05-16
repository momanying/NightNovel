import type { H3Event } from 'h3'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
}

interface ValidationRules {
  [key: string]: ValidationRule
}

export const validateInput = (rules: ValidationRules) => {
  return async (event: H3Event) => {
    // 只在特定的HTTP方法下进行验证
    const method = event.method.toUpperCase()
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return
    }

    const body = await readBody(event)
    const errors: { [key: string]: string } = {}

    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field]

      // 必填检查
      if (rule.required && !value) {
        errors[field] = rule.message || `${field} 是必填项`
        continue
      }

      if (value) {
        // 长度检查
        if (rule.minLength && value.length < rule.minLength) {
          errors[field] = rule.message || `${field} 最小长度为 ${rule.minLength}`
          continue
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors[field] = rule.message || `${field} 最大长度为 ${rule.maxLength}`
          continue
        }

        // 正则匹配检查
        if (rule.pattern && !rule.pattern.test(value)) {
          errors[field] = rule.message || `${field} 格式不正确`
          continue
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 400,
        data: {
          message: '输入验证失败',
          errors
        }
      })
    }
  }
}