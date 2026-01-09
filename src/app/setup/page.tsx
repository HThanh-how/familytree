"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cog6ToothIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function SetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        authentikClientId: "",
        authentikClientSecret: "",
        authentikIssuer: "",
        authSecret: "",
    });

    // Check if already configured
    useEffect(() => {
        async function checkSetup() {
            try {
                const res = await fetch("/api/setup");
                const data = await res.json();
                if (data.configured) {
                    router.replace("/");
                }
            } catch (e) {
                console.error("Failed to check setup status", e);
            } finally {
                setLoading(false);
            }
        }
        checkSetup();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save configuration");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex items-center justify-center mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Cấu hình Hệ thống
                </h1>
                <p className="text-center text-gray-500 mb-6 text-sm">
                    Đây là lần chạy đầu tiên. Vui lòng nhập thông tin Authentik để bắt đầu.
                </p>

                {success ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircleIcon className="h-16 w-16 mb-4" />
                        <p className="text-lg font-semibold">Cấu hình thành công!</p>
                        <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center text-sm">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="authentikIssuer" className="block text-sm font-medium text-gray-700 mb-1">
                                Authentik Issuer URL
                            </label>
                            <input
                                type="url"
                                id="authentikIssuer"
                                name="authentikIssuer"
                                value={formData.authentikIssuer}
                                onChange={handleChange}
                                placeholder="https://auth.example.com/application/o/myapp/"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="authentikClientId" className="block text-sm font-medium text-gray-700 mb-1">
                                Client ID
                            </label>
                            <input
                                type="text"
                                id="authentikClientId"
                                name="authentikClientId"
                                value={formData.authentikClientId}
                                onChange={handleChange}
                                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="authentikClientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                                Client Secret
                            </label>
                            <input
                                type="password"
                                id="authentikClientSecret"
                                name="authentikClientSecret"
                                value={formData.authentikClientSecret}
                                onChange={handleChange}
                                placeholder="••••••••••••••••••••••••"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="authSecret" className="block text-sm font-medium text-gray-700 mb-1">
                                Auth Secret (JWT Secret)
                            </label>
                            <input
                                type="password"
                                id="authSecret"
                                name="authSecret"
                                value={formData.authSecret}
                                onChange={handleChange}
                                placeholder="Chuỗi ngẫu nhiên dùng để mã hóa session"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                            <p className="text-xs text-gray-400 mt-1">Có thể tự tạo bằng lệnh: <code className="bg-gray-100 px-1 rounded">openssl rand -base64 32</code></p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu cấu hình & Bắt đầu"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
