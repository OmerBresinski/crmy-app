import { Request, Response, NextFunction } from "express";
import prisma from "../services/prismaClient";
import { AppError } from "../utils/errorHandler";

/**
 * Get the currently authenticated user's profile
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      status: "success",
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Other user controller functions can be added here
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation for getting all users
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation for getting a specific user
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation for creating a user
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation for updating a user
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Implementation for deleting a user
};
