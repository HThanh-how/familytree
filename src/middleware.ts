import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
    const pathname = req.nextUrl.pathname;

    // Allow setup page and API to be accessed always
    if (pathname.startsWith("/setup") || pathname.startsWith("/api/setup")) {
        return NextResponse.next();
    }

    // Check if app is configured by calling the setup check API internally
    // This is a simple approach; for production, consider edge-compatible checks.
    // We'll use a fetch to the local API route.
    try {
        const setupCheckUrl = new URL("/api/setup", req.nextUrl.origin);
        const res = await fetch(setupCheckUrl.toString());
        const data = await res.json();

        if (!data.configured) {
            return NextResponse.redirect(new URL("/setup", req.nextUrl));
        }
    } catch (e) {
        // If setup check fails, redirect to setup as fallback
        console.error("Setup check failed:", e);
        return NextResponse.redirect(new URL("/setup", req.nextUrl));
    }

    // Existing auth logic
    const isLoggedIn = !!req.auth
    const isOnAdmin = pathname.startsWith("/admin")

    if (isOnAdmin) {
        if (!isLoggedIn) return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
        const userRole = req.auth?.user?.role?.name
        if (userRole !== "Admin") {
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

