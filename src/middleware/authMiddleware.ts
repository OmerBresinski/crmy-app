import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtGenerator";
import { AppError } from "../utils/errorHandler";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(
        new AppError("Authentication required. No token provided.", 401)
      );
    }

    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new AppError("Authentication failed. Invalid token.", 401));
  }
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "ADMIN") {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }
  next();
};
