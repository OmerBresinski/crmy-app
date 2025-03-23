import { Request, Response, NextFunction } from "express";
import prisma from "../services/prismaClient";
import { AppError } from "../utils/errorHandler";

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError("User not authenticated", 401));
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        createdBy: userId,
        users: {
          connect: { id: userId },
        },
      },
    });

    // Update user's organization and role
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: "ADMIN",
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!organization) {
      return next(new AppError("Organization not found", 404));
    }

    // Check if user belongs to this organization
    const userBelongsToOrg = organization.users.some(
      (user) => user.id === userId
    );
    if (!userBelongsToOrg) {
      return next(
        new AppError("You do not have access to this organization", 403)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check if user is admin
    if (userRole !== "ADMIN") {
      return next(new AppError("Only admins can update organizations", 403));
    }

    // Check if organization exists and user is part of it
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!organization) {
      return next(new AppError("Organization not found", 404));
    }

    const userBelongsToOrg = organization.users.some(
      (user) => user.id === userId
    );
    if (!userBelongsToOrg) {
      return next(
        new AppError("You do not have access to this organization", 403)
      );
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: { name },
    });

    res.status(200).json({
      status: "success",
      data: {
        organization: updatedOrganization,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Check if user is admin
    if (userRole !== "ADMIN") {
      return next(new AppError("Only admins can delete organizations", 403));
    }

    // Check if organization exists and user is part of it
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!organization) {
      return next(new AppError("Organization not found", 404));
    }

    const userBelongsToOrg = organization.users.some(
      (user) => user.id === userId
    );
    if (!userBelongsToOrg) {
      return next(
        new AppError("You do not have access to this organization", 403)
      );
    }

    // Delete the organization
    await prisma.organization.delete({
      where: { id },
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
