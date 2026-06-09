import type { Context, Next } from 'hono';

export async function validateContentType(c: Context, next: Next) {
  const method = c.req.method;

  // Only validate content-type for methods that typically have a body
  if (['POST', 'PUT', 'PATCH'].includes(method) && c.req.path.startsWith('/api')) {
    const contentType = c.req.header('content-type');

    if (!contentType) {
      return c.json(
        { error: 'Content-Type header is required for this request' },
        400
      );
    }

    if (
      !contentType.includes('application/json') &&
      !contentType.includes('multipart/form-data') &&
      !contentType.includes('application/octet-stream')
    ) {
      return c.json(
        { error: 'Unsupported Content-Type. Use application/json, multipart/form-data, or application/octet-stream' },
        415
      );
    }
  }

  return next();
}
