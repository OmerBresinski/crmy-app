import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "../services/prismaClient";
import { generateToken } from "../utils/jwtGenerator";
import { AppError } from "../utils/errorHandler";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with admin role
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Create organization if name is provided
    if (organizationName) {
      await prisma.organization.create({
        data: {
          name: organizationName,
          createdBy: newUser.id,
          users: {
            connect: { id: newUser.id },
          },
        },
      });

      // Update user with organization
      await prisma.user.update({
        where: { id: newUser.id },
        data: { role: "ADMIN" },
      });
    }

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new AppError("Invalid credentials", 401));
    }

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
