import type { Context, Next } from 'hono';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max requests per window

function getClientIP(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

export async function rateLimit(c: Context, next: Next) {
  const ip = getClientIP(c);
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    c.header('X-RateLimit-Limit', MAX_REQUESTS.toString());
    c.header('X-RateLimit-Remaining', (MAX_REQUESTS - 1).toString());
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    c.header('X-RateLimit-Limit', MAX_REQUESTS.toString());
    c.header('X-RateLimit-Remaining', '0');
    c.header('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
    return c.json({ error: 'Too many requests. Please try again later.' }, 429);
  }

  entry.count++;
  c.header('X-RateLimit-Limit', MAX_REQUESTS.toString());
  c.header('X-RateLimit-Remaining', (MAX_REQUESTS - entry.count).toString());

  return next();
}

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);
