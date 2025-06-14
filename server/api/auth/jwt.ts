import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-key'

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: '30d'
  })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { id: string }
}

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { id: string }
}