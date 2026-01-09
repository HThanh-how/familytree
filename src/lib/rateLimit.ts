import { NextResponse } from "next/server";

// Simple in-memory rate limiter
// For production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
    windowMs?: number; // Time window in milliseconds
    maxRequests?: number; // Max requests per window
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
};

export function rateLimit(
    identifier: string,
    options?: RateLimitOptions
): { allowed: boolean; remaining: number; resetIn: number } {
    const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
    const now = Date.now();

    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired one
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

export function rateLimitResponse(resetIn: number): NextResponse {
    return NextResponse.json(
        {
            error: "Too many requests",
            retryAfter: Math.ceil(resetIn / 1000),
        },
        {
            status: 429,
            headers: {
                "Retry-After": String(Math.ceil(resetIn / 1000)),
            },
        }
    );
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 1000); // Clean every minute
