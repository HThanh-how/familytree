import prisma from "./prisma";

interface AuditLogEntry {
    userId?: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    entity: string;
    entityId?: string;
    oldData?: object;
    newData?: object;
    ipAddress?: string;
    userAgent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                action: entry.action,
                entity: entry.entity,
                entityId: entry.entityId,
                oldData: entry.oldData ? JSON.stringify(entry.oldData) : null,
                newData: entry.newData ? JSON.stringify(entry.newData) : null,
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent,
            },
        });
    } catch (error) {
        console.error("[AuditLog] Failed to log audit entry:", error);
    }
}

export async function getAuditLogs(options?: {
    entity?: string;
    userId?: string;
    limit?: number;
    offset?: number;
}) {
    return prisma.auditLog.findMany({
        where: {
            entity: options?.entity,
            userId: options?.userId,
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
    });
}
