import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from "@clerk/express";
import pool from "./src/config/db";
import routes from "./src/routes";
import errorHandler from "./src/middleware/errorHandler";
import swaggerSpec from "./src/config/swagger";
import runMigrations from "./src/config/migrate";
import { initSocket } from "./src/config/socket";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk authentication
app.use(clerkMiddleware());

// Static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root redirect to Swagger
app.get("/", (_req, res) => res.redirect("/api-docs"));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

// Start server & verify DB connection
const start = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();

    // Run pending migrations
    await runMigrations();

    // Initialize Socket.IO
    initSocket(server);
    console.log("Socket.IO initialized");

    server.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to connect to PostgreSQL:", message);
    process.exit(1);
  }
};

start();
