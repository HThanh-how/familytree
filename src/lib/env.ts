import { z } from "zod";

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Optional: Authentik (can be configured via Setup Wizard)
    AUTH_AUTHENTIK_ID: z.string().optional(),
    AUTH_AUTHENTIK_SECRET: z.string().optional(),
    AUTH_AUTHENTIK_ISSUER: z.string().url().optional(),
    AUTH_SECRET: z.string().optional(),

    // Optional: Analytics
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:");
        console.error(parsed.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables");
    }

    return parsed.data;
}

export const env = validateEnv();
