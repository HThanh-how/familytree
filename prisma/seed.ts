import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // Create Permissions
    const perms = [
        { name: 'user.create', description: 'Can create users' },
        { name: 'user.read', description: 'Can view users' },
        { name: 'user.update', description: 'Can update users' },
        { name: 'user.delete', description: 'Can delete users' },
        { name: 'person.view_sensitive', description: 'Can view sensitive info (notes, living)' },
        { name: 'person.edit', description: 'Can edit person details' },
        { name: 'person.create', description: 'Can add new people' },
        { name: 'person.delete', description: 'Can delete people' },
        { name: 'tree.manage', description: 'Can manage tree structure' },
    ]

    for (const p of perms) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: p,
        })
    }

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrator with full access',
            permissions: {
                connect: perms.map(p => ({ name: p.name })),
            },
        },
    })

    // Update Admin if exists to ensure they get new perms
    await prisma.role.update({
        where: { name: 'Admin' },
        data: {
            permissions: {
                connect: perms.map(p => ({ name: p.name })),
            },
        }
    })

    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: {
            name: 'User',
            description: 'Standard user',
            permissions: {
                connect: [
                    { name: 'user.read' },
                    { name: 'person.view_sensitive' },
                ],
            },
        },
    })

    // Manager/Editor Role (Example for enterprise)
    const editorRole = await prisma.role.upsert({
        where: { name: 'Editor' },
        update: {},
        create: {
            name: 'Editor',
            description: 'Can edit family tree data',
            permissions: {
                connect: [
                    { name: 'user.read' },
                    { name: 'person.view_sensitive' },
                    { name: 'person.edit' },
                    { name: 'person.create' },
                    { name: 'tree.manage' },
                ],
            },
        },
    })

    console.log({ adminRole, userRole, editorRole })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
