"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function usePermission(permissionName: string) {
    const { data: session } = useSession();

    const hasPermission = useMemo(() => {
        if (!session?.user?.role?.permissions) return false;

        // Admin has all permissions usually, but lets check explicit permissions first
        // or if the role name is Admin, return true (optional shortcut)
        if (session.user.role.name === 'Admin') return true;

        return session.user.role.permissions.some(p => p.name === permissionName);
    }, [session, permissionName]);

    return { hasPermission, isLoading: !session }; // session is undefined initially
}
