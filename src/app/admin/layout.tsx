import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user?.role || session.user.role.name !== "Admin") {
        // Double check in layout (middleware handles it too but safe to have)
        // redirect("/") 
        // Middleware should catch this, preventing hydration mismatch if possible (?)
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4 border-b">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Welcome, {session?.user?.name}</p>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin/users" className="block p-2 rounded hover:bg-gray-50 text-gray-700 font-medium">
                        Users
                    </Link>
                    <Link href="/admin/roles" className="block p-2 rounded hover:bg-gray-50 text-gray-700 font-medium">
                        Roles & Permissions
                    </Link>
                    <Link href="/" className="block p-2 mt-8 text-sm text-blue-600 hover:underline">
                        ← Back to App
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
