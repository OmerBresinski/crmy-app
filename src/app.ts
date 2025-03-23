import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRoutes } from "./routes/authRoutes";
import { organizationRoutes } from "./routes/organizationRoutes";
import { userRoutes } from "./routes/userRoutes";
import { taskRoutes } from "./routes/taskRoutes";
import { errorHandler } from "./utils/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
