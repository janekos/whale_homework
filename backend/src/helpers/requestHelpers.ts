import { Response } from 'express';

export function reject(res: Response, statusCode: number, errorMessage?: string): Response {
  const defaultMessages: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error'
  };

  const message = errorMessage || defaultMessages[statusCode] || 'Error';
  return res.status(statusCode).json({ error: message });
}

export function cache(res: Response, seconds: number): void {
  res.set('Cache-Control', `public, max-age=${seconds}`);
}
