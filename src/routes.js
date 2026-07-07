import express from "express";
import { z } from "zod";

import { config } from "./config.js";
import { logger } from "./logger.js";
import { formatMessage } from "./formatter.js";
import { sendMessage } from "./bot.js";

const router = express.Router();

const notifySchema = z.object({
    text: z.string().optional(),

    status: z.enum([
        "success",
        "failed",
        "running",
        "warning",
        "info"
    ]).optional(),

    dag: z.string().optional(),
    task: z.string().optional(),
    owner: z.string().optional(),
    duration: z.string().optional(),
    environment: z.string().optional(),
    error: z.string().optional(),
    time: z.string().optional()
});

router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "max-notifier",
        uptime: process.uptime()
    });
});

router.post("/notify", async (req, res) => {

    const apiKey = req.header("X-API-Key");

    if (apiKey !== config.API_KEY) {
        return res.status(401).json({
            success: false,
            message: "Invalid API key"
        });
    }

    const result = notifySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            errors: result.error.flatten()
        });
    }

    try {

        const text = formatMessage(result.data);

        await sendMessage(text);

        logger.info("Notification sent");

        return res.json({
            success: true
        });

    } catch (err) {

        logger.error(err);

        return res.status(500).json({
            success: false,
            message: "Unable to send notification"
        });

    }

});

export default router;