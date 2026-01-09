"use client";

export function PersonCardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-6 bg-gray-200 rounded w-32" />
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
        </div>
    );
}

export function GenerationSkeleton() {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <PersonCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function TreeNodeSkeleton({ depth = 0 }: { depth?: number }) {
    if (depth > 2) return null;

    return (
        <div className="ml-6 animate-pulse">
            <div className="flex items-center py-2">
                <div className="w-4 h-4 bg-gray-200 rounded mr-1" />
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
            </div>
            {depth < 2 && (
                <div className="border-l border-gray-200 ml-2 pl-2">
                    <TreeNodeSkeleton depth={depth + 1} />
                    <TreeNodeSkeleton depth={depth + 1} />
                </div>
            )}
        </div>
    );
}

export function FamilyTreeSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <GenerationSkeleton />
            <GenerationSkeleton />
        </div>
    );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {[1, 2, 3, 4].map((i) => (
                            <th key={i} className="px-6 py-3">
                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i}>
                            {[1, 2, 3, 4].map((j) => (
                                <td key={j} className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
