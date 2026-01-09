import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const REQUIRED_KEYS = [
    "AUTH_AUTHENTIK_ID",
    "AUTH_AUTHENTIK_SECRET",
    "AUTH_AUTHENTIK_ISSUER",
    "AUTH_SECRET",
];

export async function GET() {
    try {
        const configs = await prisma.appConfig.findMany({
            where: {
                key: { in: REQUIRED_KEYS },
            },
        });

        const configured = REQUIRED_KEYS.every((key) =>
            configs.some((c) => c.key === key && c.value)
        );

        return NextResponse.json({ configured });
    } catch (error) {
        console.error("Error checking setup status:", error);
        return NextResponse.json({ configured: false });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { authentikClientId, authentikClientSecret, authentikIssuer, authSecret } = body;

        if (!authentikClientId || !authentikClientSecret || !authentikIssuer || !authSecret) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Upsert all config values
        const configData = [
            { key: "AUTH_AUTHENTIK_ID", value: authentikClientId },
            { key: "AUTH_AUTHENTIK_SECRET", value: authentikClientSecret },
            { key: "AUTH_AUTHENTIK_ISSUER", value: authentikIssuer },
            { key: "AUTH_SECRET", value: authSecret },
        ];

        for (const config of configData) {
            await prisma.appConfig.upsert({
                where: { key: config.key },
                update: { value: config.value },
                create: { key: config.key, value: config.value },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving config:", error);
        return NextResponse.json(
            { error: "Failed to save configuration" },
            { status: 500 }
        );
    }
}
