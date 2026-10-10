import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers so a rejected promise reaches Express's error
// handling instead of crashing the process.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error.' });
}
