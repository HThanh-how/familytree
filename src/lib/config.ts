import prisma from "./prisma";

// Cache for app config
let configCache: Map<string, string> | null = null;
let configCacheTime: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getAppConfig(key: string): Promise<string | null> {
    // Check cache
    if (configCache && Date.now() - configCacheTime < CACHE_TTL) {
        return configCache.get(key) || null;
    }

    // Fetch all config from DB
    try {
        const configs = await prisma.appConfig.findMany();
        configCache = new Map(configs.map((c) => [c.key, c.value]));
        configCacheTime = Date.now();
        return configCache.get(key) || null;
    } catch (error) {
        console.error("Error fetching app config:", error);
        return null;
    }
}

export async function isAppConfigured(): Promise<boolean> {
    const requiredKeys = [
        "AUTH_AUTHENTIK_ID",
        "AUTH_AUTHENTIK_SECRET",
        "AUTH_AUTHENTIK_ISSUER",
        "AUTH_SECRET",
    ];

    for (const key of requiredKeys) {
        const value = await getAppConfig(key);
        if (!value) return false;
    }
    return true;
}

export function invalidateConfigCache(): void {
    configCache = null;
    configCacheTime = 0;
}
