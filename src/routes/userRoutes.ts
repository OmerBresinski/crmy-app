import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

export const userRoutes = Router();

// All user routes require authentication
userRoutes.use(authenticate);

// Create a new user (admin only)
userRoutes.post("/", authorizeAdmin);

// Get all users in the organization
userRoutes.get("/");

// Get a specific user
userRoutes.get("/:id");

// Update a user (admin only)
userRoutes.put("/:id", authorizeAdmin);

// Delete a user (admin only)
userRoutes.delete("/:id", authorizeAdmin);
