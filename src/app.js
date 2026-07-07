import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { config } from "./config.js";
import { logger } from "./logger.js";
import routes from "./routes.js";

const app = express();

/**
 * Middlewares
 */
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.use(
    pinoHttp({
        logger,
        customLogLevel: function (req, res, err) {
            if (res.statusCode >= 500 || err) return "error";
            if (res.statusCode >= 400) return "warn";
            return "info";
        }
    })
);

/**
 * Routes
 */
app.use("/", routes);

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

/**
 * Start server
 */
app.listen(config.PORT, () => {
    logger.info(`🚀 MAX notifier started on port ${config.PORT}`);
});