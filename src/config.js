import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    MAX_BOT_TOKEN: z.string().min(1),
    MAX_CHAT_ID: z.string().min(1),

    PORT: z
        .string()
        .default("3000")
        .transform(Number),

    API_KEY: z.string().min(8),

    NODE_ENV: z
        .enum([
            "development",
            "production"
        ])
        .default("development")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("\n❌ Ошибка конфигурации:\n");

    parsed.error.issues.forEach(issue => {
        console.error(`• ${issue.path.join(".")} — ${issue.message}`);
    });

    process.exit(1);
}

export const config = parsed.data;