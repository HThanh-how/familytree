import { Role, Permission } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            role?: Role & { permissions: Permission[] } | null
        } & DefaultSession["user"]
    }
}
