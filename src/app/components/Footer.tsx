"use client";

import Link from 'next/link';
import { getFamilyFullName } from '@/utils/config';

const Footer = () => {
  // Get full family name with suffix
  const familyFullName = getFamilyFullName();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left - About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Về gia phả</h3>
            <p className="text-sm leading-6 text-gray-600">
              Gia phả họ {familyFullName} là nơi ghi lại lịch sử và truyền thống
              của dòng họ, nhằm lưu giữ ký ức gia đình và gìn giữ văn hoá tổ
              tiên.
            </p>
          </div>

          {/* Middle - Open source info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Mã nguồn mở</h3>
            <p className="text-sm leading-6 text-gray-600">
              Dự án này là phần mềm gia phả mã nguồn mở, bạn có thể xem mã nguồn
              trên GitHub.
            </p>
            <p className="text-sm leading-6 text-gray-600">
              <Link 
                href="https://github.com/qiaoshouqing/familytree" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Kho GitHub
              </Link>
            </p>
          </div>

          {/* Right - Friendly links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">Liên kết hữu ích</h3>
            <ul role="list" className="mt-2 space-y-2">
              <li>
                <Link 
                  href="https://fatemaster.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm leading-6 text-blue-600 hover:text-blue-800"
                >
                  FateMaster.AI
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  Website xem tử vi bằng AI, cung cấp dịch vụ phân tích mệnh lý
                  thông minh
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs leading-5 text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Dự án gia phả - Giấy phép MIT
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 