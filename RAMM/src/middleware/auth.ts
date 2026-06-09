import type { Context, Next } from 'hono';
import { getToken } from '@auth/core/jwt';

const PUBLIC_PATHS = [
  '/api/auth',
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
}

export async function authGuard(c: Context, next: Next) {
  const path = c.req.path;
  const method = c.req.method;

  // Skip auth for non-API routes and public API paths (auth endpoints)
  if (!path.startsWith('/api') || isPublicPath(path)) {
    return next();
  }

  // Allow all GET requests without auth (read-only access)
  // Only protect mutation operations (POST, PUT, PATCH, DELETE)
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    // Still try to attach user info if token is available
    if (process.env.AUTH_SECRET) {
      try {
        const token = await getToken({
          req: c.req.raw,
          secret: process.env.AUTH_SECRET,
          secureCookie: process.env.AUTH_URL?.startsWith('https') ?? false,
        });
        if (token) {
          c.set('userId', token.sub);
          c.set('userEmail', token.email);
          c.set('userName', token.name);
        }
      } catch {
        // Token parsing failed - continue without user context
      }
    }
    return next();
  }

  // Skip if AUTH_SECRET is not configured (development mode)
  if (!process.env.AUTH_SECRET) {
    return next();
  }

  try {
    const token = await getToken({
      req: c.req.raw,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https') ?? false,
    });

    if (!token) {
      return c.json({ error: 'Unauthorized. Please sign in to perform this action.' }, 401);
    }

    // Attach user info to the request context for downstream handlers
    c.set('userId', token.sub);
    c.set('userEmail', token.email);
    c.set('userName', token.name);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication error' }, 401);
  }

  return next();
}
