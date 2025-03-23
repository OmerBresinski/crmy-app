import { Router } from "express";
import {
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organizationController";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware";

export const organizationRoutes = Router();

// All organization routes require authentication
organizationRoutes.use(authenticate);

// Create organization
organizationRoutes.post("/", createOrganization);

// Get organization details
organizationRoutes.get("/:id", getOrganization);

// Update organization - requires admin role
organizationRoutes.put("/:id", authorizeAdmin, updateOrganization);

// Delete organization - requires admin role
organizationRoutes.delete("/:id", authorizeAdmin, deleteOrganization);
