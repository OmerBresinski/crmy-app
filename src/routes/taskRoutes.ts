import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";

export const taskRoutes = Router();

// All task routes require authentication
taskRoutes.use(authenticate);

// Create a new task
taskRoutes.post("/");

// Get all tasks
taskRoutes.get("/");

// Get a specific task
taskRoutes.get("/:id");

// Update a task
taskRoutes.put("/:id");

// Delete a task
taskRoutes.delete("/:id");
