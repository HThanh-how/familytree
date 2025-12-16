"use client";

import { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { getFamilyFullName } from '@/utils/config';
import Link from 'next/link';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');
  // 获取完整姓氏名称（带"氏"字）
  const familyFullName = getFamilyFullName();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebug('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDebug(`Đăng nhập thành công! Chào mừng ${name}`);
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_time', Date.now().toString());
        onLoginSuccess();
      } else {
        // On login fail, only show error message
        setError(data.message || 'Xác thực thất bại, vui lòng kiểm tra lại họ tên');
      }
    } catch (err) {
      console.error('Login request error:', err);
      setError('Có lỗi xảy ra khi xác thực, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show valid user hint (for debug only)
  const showHint = () => {
    setDebug('Hãy nhập đúng họ tên có trong gia phả để đăng nhập');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gia phả họ {familyFullName}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vui lòng nhập họ tên để xác thực
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="sr-only">Họ tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Họ tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Đang xác thực...' : 'Vào xem gia phả'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={showHint}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cần trợ giúp?
            </button>
          </div>
          
          {debug && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 whitespace-pre-line">
              {debug}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-blue-600 font-medium">
              Đây là một dự án mã nguồn mở, hãy ghé thăm
              <Link 
                href="https://github.com/qiaoshouqing/familytree" 
                target="_blank"
                rel="noopener noreferrer" 
                className="ml-1 inline-flex items-center text-blue-700 underline font-semibold hover:text-blue-900 hover:bg-blue-50 rounded px-1 transition-colors"
              >
                kho GitHub của chúng tôi
                <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 