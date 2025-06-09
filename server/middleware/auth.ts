import { UserModel } from '../models'
import { defineEventHandler, getRequestHeader, createError, type H3Event } from 'h3'
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

// Define public routes that do not require authentication
// Exact paths
const PUBLIC_EXACT_ROUTES: string[] = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/tags/cloud',
  '/api/comments/popular', // For GETting popular comments by query
];

// Prefixes for public routes (e.g., pages for novels and comments)
const PUBLIC_PREFIX_ROUTES: string[] = [
  '/novels/',
  '/comments/',
  '/api/novels/', // For GETting novels list and individual novels
];

export default defineEventHandler(async (event: H3Event) => {
  // In development, prioritize real auth headers but fall back to a mock user.
  if (process.env.NODE_ENV === 'development') {
    const authHeader = getRequestHeader(event, 'Authorization');
    // If an auth header is present, try to authenticate the user normally.
    // This allows for proper testing of authenticated routes in dev.
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        if (decoded && decoded.id) {
          const user = await UserModel.findById(decoded.id).select('-password').lean();
          if (user) {
            event.context.auth = { user };
            return; // Successful authentication
          }
        }
      } catch (error) {
        // This can happen if the token is expired or invalid.
        // We can ignore it and fall back to the mock user for convenience.
        console.warn(`[Auth Middleware] DEV MODE: Invalid token provided. Falling back to mock user. Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // If no token is provided or if token validation fails, fall back to the first user in the DB.
    const mockUser = await UserModel.findOne().select('-password').lean();
    if (mockUser) {
      console.log(`[Auth Middleware] DEV MODE: No valid token. Falling back to mock user: ${mockUser.username}`);
      event.context.auth = { user: mockUser };
    } else {
      console.warn('[Auth Middleware] DEV MODE: No users found in the database to use for mock authentication.');
    }
    return;
  }

  // Production authentication logic
  const requestPath = event.path;
  console.log(`[Auth Middleware] PROD MODE: Request path: ${requestPath}`);

  // Check if the route is public
  const isPublicRoute = PUBLIC_EXACT_ROUTES.includes(requestPath) || 
                        PUBLIC_PREFIX_ROUTES.some(prefix => requestPath.startsWith(prefix));

  if (isPublicRoute) {
    console.log(`[Auth Middleware] PROD MODE: Path ${requestPath} is public.`);
    return; // Public route, no auth check needed
  }
  
  console.log(`[Auth Middleware] PROD MODE: Path ${requestPath} is NOT public. Proceeding with auth check.`);

  // For protected routes, verify JWT
  const authHeader = getRequestHeader(event, 'Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization token is missing or invalid.' });
  }

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
})