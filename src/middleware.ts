import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware without Prisma - auth checks happen at page/API level
export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Allow these paths without any checks
    if (
        pathname.startsWith("/setup") ||
        pathname.startsWith("/api/setup") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/health") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
