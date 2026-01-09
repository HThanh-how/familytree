import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
            database: "unknown",
            memory: {
                used: 0,
                total: 0,
            },
        },
    };

    // Check database connectivity
    try {
        await prisma.$queryRaw`SELECT 1`;
        health.checks.database = "ok";
    } catch (error) {
        health.checks.database = "error";
        health.status = "degraded";
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
    };

    const statusCode = health.status === "ok" ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
}
