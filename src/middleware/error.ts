import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super();
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
