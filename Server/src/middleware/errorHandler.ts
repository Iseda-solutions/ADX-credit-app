import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err); // you might log to a file instead
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ error: message });
}
