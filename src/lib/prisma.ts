import { PrismaClient } from "@prisma/client"
import redis from "./redis"

const prismaClientSingleton = () => {
    const client = new PrismaClient()

    return client.$extends({
        query: {
            person: {
                async $allOperations({ operation, model, args, query }) {
                    const result = await query(args)

                    // Invalidate cache on mutations
                    if (['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany'].includes(operation)) {
                        await redis.del('family_tree_data')
                        console.log(`[Prisma] Invalidated family_tree_data due to ${operation} on ${model}`)
                    }

                    return result
                }
            }
        }
    }) as unknown as PrismaClient
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
