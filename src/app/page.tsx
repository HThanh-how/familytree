"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import FamilyTree from './components/FamilyTree';
import TreeView from './components/TreeView';
import BinaryTreeView from './components/BinaryTreeView';
import Footer from './components/Footer';
import SearchBar, { SearchFilters } from './components/SearchBar';
import { useFamilyData } from '../data/familyDataWithIds';
import { QueueListIcon, Squares2X2Icon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, RectangleGroupIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { getPublicConfig, getFamilyFullName } from '@/utils/config';
import { searchFamilyData, createFilteredFamilyData, SearchResult } from '@/utils/search';
import { buildFamilyTree } from '@/utils/familyTree';
import { useSession, signIn, signOut } from "next-auth/react";
import { usePermission } from "@/hooks/usePermission";
import Link from 'next/link';


export default function Home() {
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'binary'>('list');
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Can be moved to a context for better management
  const { data: familyData, loading: dataLoading, error: dataError } = useFamilyData();

  // Auth & Permissions
  const { data: session, status } = useSession();
  const { hasPermission: canEdit } = usePermission('person.edit');
  const { hasPermission: canViewSensitive } = usePermission('person.view_sensitive');
  const { hasPermission: canManageTree } = usePermission('tree.manage');
  const isAdmin = session?.user?.role?.name === 'Admin';

  // Search related state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    searchInInfo: true,
    selectedGenerations: [],
    yearRange: {}
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const familyFullName = useMemo(() => getFamilyFullName(), []);

  // Use useMemo to cache tree data construction
  const treeData = useMemo(() => {
    if (dataLoading || dataError || !familyData.generations.length) {
      return {
        generations: [
          {
            title: "家族树 (Family Tree)",
            people: []
          }
        ]
      };
    }
    return buildFamilyTree(familyData);
  }, [familyData, dataLoading, dataError]);

  // Filtered data logic
  const filteredFamilyData = useMemo(() => {
    if (searchResults.length > 0) {
      return createFilteredFamilyData(familyData, searchResults);
    }
    return familyData;
  }, [familyData, searchResults]);

  const handleSearch = useCallback((term: string, filters: SearchFilters) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  }, []);

  // Search effect
  useEffect(() => {
    if (!dataLoading && !dataError && familyData.generations.length) {
      if (searchTerm || searchFilters.selectedGenerations.length > 0 ||
        searchFilters.yearRange.start || searchFilters.yearRange.end) {
        const results = searchFamilyData(familyData, searchTerm, searchFilters);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }
  }, [familyData, searchTerm, searchFilters, dataLoading, dataError]);

  // Theme toggle handler
  const applyTheme = useCallback((dark: boolean) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    setIsDarkMode(dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(!isDarkMode);
  }, [applyTheme, isDarkMode]);

  useEffect(() => {
    // Initialize theme
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') applyTheme(true);
      else if (storedTheme === 'light') applyTheme(false);
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme(true);
      else applyTheme(false);
    } catch {
      applyTheme(false);
    }
    setLoading(false);
  }, [applyTheme]);

  if (loading || dataLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col transition-colors duration-300">
      <header className="bg-white shadow-sm mb-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 relative">

          {/* Top-right controls */}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 border border-gray-300 shadow-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </button>

              {session ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link href="/admin" className="hidden md:inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      <Cog6ToothIcon className="h-4 w-4 mr-1" /> Admin
                    </Link>
                  )}
                  <div className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white">
                    <UserCircleIcon className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="hidden sm:inline">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    Thoát
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn("authentik")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Đăng nhập
                </button>
              )}
            </div>
            {/* Permission Indicators (Optional, good for demo) */}
            {session && (
              <div className="text-xs text-gray-400 flex gap-2">
                {canEdit && <span className="bg-green-100 text-green-800 px-1 rounded">Editor</span>}
                {canViewSensitive && <span className="bg-blue-100 text-blue-800 px-1 rounded">View+</span>}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Gia phả họ {familyFullName}
          </h1>
          <p className="mt-2 text-gray-500 text-center text-sm tracking-wide">
            Lưu truyền lịch sử · Gìn giữ văn hoá
          </p>

          <div className="mt-6 flex justify-center">
            {/* View Mode Switcher - Existing Code */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md flex items-center ${viewMode === 'list' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setViewMode('list')}
              >
                <QueueListIcon className="h-4 w-4 mr-2" />
                Dạng danh sách
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium flex items-center border-l-0 ${viewMode === 'tree' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setViewMode('tree')}
              >
                <Squares2X2Icon className="h-4 w-4 mr-2" />
                Dạng cây
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md flex items-center border-l-0 ${viewMode === 'binary' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                onClick={() => setViewMode('binary')}
              >
                <RectangleGroupIcon className="h-4 w-4 mr-2" />
                Cây nhị phân
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow">
        {dataError && (
          <div className="text-center text-red-500 mb-4">
            {dataError} - Using Default Data
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            {/* Granular Edit Control */}
            <div>
              {canEdit && (
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 shadow flex items-center">
                  <span>✎ Chỉnh sửa dữ liệu</span>
                </button>
              )}
            </div>

            <SearchBar
              onSearch={handleSearch}
              generations={familyData.generations.map(g => g.title)}
            />
          </div>

          {/* Existing Search Results Code */}
          {searchResults.length === 0 && (searchTerm || searchFilters.selectedGenerations.length > 0 ||
            searchFilters.yearRange.start || searchFilters.yearRange.end) && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">Không tìm thấy thành viên phù hợp</p>
                <p className="text-sm">Hãy thử thay đổi điều kiện tìm kiếm</p>
              </div>
            )}

          {searchResults.length > 0 && (
            <div className="text-sm text-gray-600 text-center mb-4">
              Tìm thấy <span className="font-medium text-blue-600">{searchResults.length}</span> kết quả phù hợp
            </div>
          )}
        </div>

        {/* Pass canViewSensitive if components support it (would need to update components too, but this shows integration) */}
        {viewMode === 'list' && (
          <FamilyTree
            familyData={filteredFamilyData}
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          // canViewSensitive={canViewSensitive} 
          />
        )}
        {viewMode === 'tree' && (
          <TreeView
            data={treeData}
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        )}
        {viewMode === 'binary' && (
          <BinaryTreeView
            data={treeData}
            searchTerm={searchTerm}
            searchInInfo={searchFilters.searchInInfo}
          />
        )}
      </div>

      <Footer />
    </main>
  );
}
