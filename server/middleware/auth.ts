import { UserModel } from '../models'
import { defineEventHandler, getRequestHeader, createError } from 'h3'
import jwt from 'jsonwebtoken'

// // 定义公开路由列表
// const PUBLIC_ROUTES: string[] = [
//   '/api/auth/login',
//   '/api/auth/register',
//   '/api/auth/refresh',
//   '/',                    // 主页
//   '/login',              // 登录页
//   '/register',           // 注册页
//   '/api/novels',         // 小说列表
//   '/api/tags/cloud',
//   '/api/comments', // Base comments route
//   '/api/comments/popular', // For GETting popular comments
//   '/api/comments/popular/post', // For POSTing popular comments
//   // '/api/user/password',
// ]

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key'

export default defineEventHandler(async (event) => {
  // In development, bypass all auth checks and set a mock user
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Middleware] DEV MODE: Bypassing authentication and setting mock user.');
    event.context.auth = {
      user: {
        _id: '605f1b9b8f3e4a2b4c9d0f1a', // Example of a valid MongoDB ObjectId string
        username: 'dev-user',
        email: 'dev@example.com',
        // Add other fields your API handlers might expect from a user object
      }
    };
    return; // Middleware processing is done for dev mode, request proceeds
  }

  // Production authentication logic (original logic remains here)
  const requestPath = event.path;
  console.log(`[Auth Middleware] PROD MODE: Request path: ${requestPath}`);

  // Define public routes for production - adjust as needed
  const PUBLIC_ROUTES_PROD: string[] = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/',
    '/login',
    '/register',
    '/api/novels',
    '/api/tags/cloud',
    '/api/comments/popular', // GET popular comments
    // Note: POST /api/comments/popular/post is intentionally NOT here for production
  ];

  const isPublicRouteProd = PUBLIC_ROUTES_PROD.some(publicRoute => {
    // Special handling for routes like /api/novels/:id
    if (publicRoute.endsWith('/') && requestPath.startsWith(publicRoute)) {
      return true;
    }
    // Exact match for other routes
    if (requestPath.startsWith('/api/novels/') && publicRoute === '/api/novels/') {
        return true;
    }
    return requestPath === publicRoute;
  });

  if (isPublicRouteProd) {
    console.log(`[Auth Middleware] PROD MODE: Path ${requestPath} is public.`);
    return;
  }
  
  console.log(`[Auth Middleware] PROD MODE: Path ${requestPath} is NOT public. Proceeding with auth check.`);

  const authHeader = getRequestHeader(event, 'Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      if (decoded && decoded.id) {
        const user = await UserModel.findById(decoded.id).select('-password');
        if (user) {
          event.context.auth = { user };
          return;
        } else {
          console.warn(`[Auth Middleware] PROD MODE: User not found for token ID: ${decoded.id} on path ${requestPath}.`);
          throw createError({ statusCode: 401, statusMessage: 'User not found for provided token.' });
        }
      } else {
         console.warn(`[Auth Middleware] PROD MODE: Token decoded but no ID found for path ${requestPath}.`);
         throw createError({ statusCode: 401, statusMessage: 'Invalid token payload.' });
      }
    } catch (error: unknown) {
      console.error(`[Auth Middleware] PROD MODE: Invalid token for path ${requestPath}:`, error instanceof Error ? error.message : 'Unknown error');
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token.' });
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Authorization token is missing or invalid (Prod Mode).'
  });
})