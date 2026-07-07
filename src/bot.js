import { Bot } from "@maxhub/max-bot-api";
import { config } from "./config.js";
import { logger } from "./logger.js";

const bot = new Bot(config.MAX_BOT_TOKEN);

export async function sendMessage(text) {
    try {
        const res = await bot.api.sendMessageToChat(
            config.MAX_CHAT_ID,
            String(text)
        );

        logger.info("Message sent successfully");

        return res;

    } catch (error) {
        logger.error(error, "Failed to send message");
        throw error;
    }
}