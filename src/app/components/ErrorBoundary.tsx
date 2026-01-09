"use client";

import React, { Component, ReactNode } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Đã xảy ra lỗi
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Rất tiếc, đã có lỗi xảy ra khi hiển thị nội dung này.
                        </p>
                        {this.state.error && (
                            <details className="text-left bg-gray-100 p-3 rounded-lg mb-4 text-xs">
                                <summary className="cursor-pointer text-gray-700 font-medium">
                                    Chi tiết lỗi
                                </summary>
                                <pre className="mt-2 overflow-auto text-red-600">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Thử lại
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
