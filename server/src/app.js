const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initializeDatabase } = require("./db");
const dashboardRouter = require("./routes/dashboard");
const patientsRouter = require("./routes/patients");
const doctorsRouter = require("./routes/doctors");
const appointmentsRouter = require("./routes/appointments");
const consultationsRouter = require("./routes/consultations");
const billingRouter = require("./routes/billing");

let initialized = false;

function getAllowedOrigins() {
  return (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function createApp() {
  if (!initialized) {
    initializeDatabase();
    initialized = true;
  }

  const configuredOrigins = getAllowedOrigins();
  const isProduction = process.env.NODE_ENV === "production";
  const app = express();

  app.use(helmet());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use(limiter);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin && !isProduction) {
          callback(null, true);
          return;
        }

        if (configuredOrigins.length === 0 && isProduction) {
          callback(new Error("CORS not configured for production."));
          return;
        }

        if (!origin || configuredOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  const apiKey = process.env.API_KEY;
  if (apiKey) {
    app.use("/api", (req, res, next) => {
      if (req.path === "/health") return next();

      const provided =
        req.headers["x-api-key"] ||
        req.headers.authorization?.replace(/^Bearer\s+/i, "");

      if (provided !== apiKey) {
        return res.status(401).json({ error: "Invalid or missing API key." });
      }

      next();
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, mode: "sqlite" });
  });

  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/patients", patientsRouter);
  app.use("/api/doctors", doctorsRouter);
  app.use("/api/appointments", appointmentsRouter);
  app.use("/api/consultations", consultationsRouter);
  app.use("/api/billing", billingRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found." });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "Unexpected server error." });
  });

  return app;
}

module.exports = {
  createApp,
};
