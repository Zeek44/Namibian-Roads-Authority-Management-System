import type { Context, Next } from 'hono';

export async function securityHeaders(c: Context, next: Next) {
  await next();

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  c.header('X-Frame-Options', 'SAMEORIGIN');

  // XSS protection
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  c.header(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );
}
