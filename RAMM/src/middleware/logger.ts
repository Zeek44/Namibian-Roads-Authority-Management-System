import type { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  console[logLevel](
    `${method} ${path} ${status} ${duration}ms`
  );
}
