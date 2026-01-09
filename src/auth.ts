import NextAuth from "next-auth"
import Authentik from "next-auth/providers/authentik"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

// Helper to get config from DB synchronously (for NextAuth init)
// Note: NextAuth config is evaluated at startup, so we use env vars initially.
// For dynamic config, we'll rely on the middleware to check setup status.
// The actual credentials come from DB via a workaround (see below).

async function getAuthConfig() {
    const configs = await prisma.appConfig.findMany();
    const configMap = new Map(configs.map(c => [c.key, c.value]));
    return {
        clientId: configMap.get("AUTH_AUTHENTIK_ID") || process.env.AUTH_AUTHENTIK_ID || "",
        clientSecret: configMap.get("AUTH_AUTHENTIK_SECRET") || process.env.AUTH_AUTHENTIK_SECRET || "",
        issuer: configMap.get("AUTH_AUTHENTIK_ISSUER") || process.env.AUTH_AUTHENTIK_ISSUER || "",
    };
}

// For NextAuth v5 with dynamic config, we need to use a factory pattern
// However, since NextAuth configuration is static at module load, 
// we'll use environment variables as fallback and recommend restart after setup.
// A more advanced approach would be to use NextAuth's authorize dynamically,
// but for simplicity, we'll read from DB if available, else fallback to env.

// For now, let's try to read at module init (blocking, not ideal but works)
let authentikConfig = {
    clientId: process.env.AUTH_AUTHENTIK_ID || "",
    clientSecret: process.env.AUTH_AUTHENTIK_SECRET || "",
    issuer: process.env.AUTH_AUTHENTIK_ISSUER || "",
};

// Async IIFE to populate config from DB at startup
// This is a workaround since NextAuth doesn't fully support async config
(async () => {
    try {
        const dbConfig = await getAuthConfig();
        if (dbConfig.clientId) authentikConfig.clientId = dbConfig.clientId;
        if (dbConfig.clientSecret) authentikConfig.clientSecret = dbConfig.clientSecret;
        if (dbConfig.issuer) authentikConfig.issuer = dbConfig.issuer;
    } catch (e) {
        console.log("[Auth] Could not load config from DB, using env vars");
    }
})();

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Authentik({
            clientId: authentikConfig.clientId,
            clientSecret: authentikConfig.clientSecret,
            issuer: authentikConfig.issuer,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { role: { include: { permissions: true } } }
                })
                session.user.role = dbUser?.role
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            const userCount = await prisma.user.count()
            if (userCount === 1) {
                const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } })
                if (adminRole) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { roleId: adminRole.id }
                    })
                }
            } else {
                const userRole = await prisma.role.findUnique({ where: { name: "User" } })
                if (userRole) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { roleId: userRole.id }
                    })
                }
            }
        }
    }
})

