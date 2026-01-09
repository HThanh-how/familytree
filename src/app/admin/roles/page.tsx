import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export default async function RolesPage() {
    const roles = await prisma.role.findMany({ include: { permissions: true } })
    const permissions = await prisma.permission.findMany()

    async function createRole(formData: FormData) {
        "use server"
        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const permissionIds = formData.getAll("permissions") as string[]

        if (!name) return

        try {
            await prisma.role.create({
                data: {
                    name,
                    description,
                    permissions: {
                        connect: permissionIds.map(id => ({ id }))
                    }
                }
            })
            revalidatePath("/admin/roles")
        } catch (e) {
            console.error("Failed to create role", e)
        }
    }

    async function deleteRole(formData: FormData) {
        "use server"
        const roleId = formData.get("roleId") as string
        // Prevent deleting Admin or User roles for safety if needed, but for now allow raw power
        if (!roleId) return
        try {
            await prisma.role.delete({ where: { id: roleId } })
            revalidatePath("/admin/roles")
        } catch (e) {
            console.error("Failed to delete role", e)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Create New Role</h2>
                <form action={createRole} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role Name</label>
                        <input type="text" name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="e.g. Editor" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" name="description" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Description" />
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-700">Permissions</span>
                        <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                            {permissions.map((perm) => (
                                <label key={perm.id} className="inline-flex items-center">
                                    <input type="checkbox" name="permissions" value={perm.id} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-600" title={perm.description || ""}>{perm.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Create Role
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Existing Roles</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-4 relative">
                            <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{role.description}</p>
                            <div className="text-xs text-gray-500 mb-4">
                                <strong>Permissions:</strong>
                                <ul className="list-disc list-inside mt-1">
                                    {role.permissions.map(p => (
                                        <li key={p.id}>{p.name}</li>
                                    ))}
                                    {role.permissions.length === 0 && <li>No permissions</li>}
                                </ul>
                            </div>
                            <form action={deleteRole} className="absolute top-4 right-4">
                                <input type="hidden" name="roleId" value={role.id} />
                                <button type="submit" className="text-red-600 hover:text-red-800 text-sm" disabled={role.name === 'Admin' || role.name === 'User'}>Delete</button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
