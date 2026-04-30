import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { clerkMiddleware } from "@clerk/express";
import pool from "./src/config/db";
import routes from "./src/routes";
import errorHandler from "./src/middleware/errorHandler";
import swaggerSpec from "./src/config/swagger";

const app = express();

// CORS — allow localhost in dev, production frontend URL in prod
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:4200"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: allowedOrigins,
  }),
);

// Static files (uploaded images) — only useful locally
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (_req, res) => res.redirect("/api-docs"));

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

// Local dev only — Vercel handles the server in production
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  const start = async (): Promise<void> => {
    try {
      const client = await pool.connect();
      console.log("Connected to PostgreSQL");
      client.release();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to connect to PostgreSQL:", message);
      process.exit(1);
    }
  };

  start();
}

export default app;
