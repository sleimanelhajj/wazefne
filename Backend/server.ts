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
// 1. Explicitly configure CORS to allow the Authorization header from Angular
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Quick sanity check to ensure dotenv loaded correctly from your root dir
if (!process.env.CLERK_SECRET_KEY) {
  console.error("⚠️ CLERK_SECRET_KEY is missing. Check your .env pathing.");
}

// 2. Configure Clerk to explicitly accept tokens issued for your Angular app
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: ["http://localhost:4200"],
  }),
);

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
