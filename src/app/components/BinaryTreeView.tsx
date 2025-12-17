"use client";

import { useMemo, useState, useCallback, useEffect } from 'react';
import { FamilyData, Person } from '@/types/family';
import { UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { highlightMatch } from '@/utils/search';

interface BinaryTreeViewProps {
  data: FamilyData;
  searchTerm?: string;
  searchInInfo?: boolean;
}

interface BinaryTreeNodeProps {
  person: Person;
  searchTerm?: string;
  searchInInfo?: boolean;
}

// Simple helper to check if a person matches current search
const isMatch = (
  person: Person,
  searchTerm?: string,
  searchInInfo?: boolean
): boolean => {
  if (!searchTerm) return false;
  const term = searchTerm.toLowerCase();
  const nameMatch = person.name.toLowerCase().includes(term);
  const infoMatch =
    !!searchInInfo &&
    !!person.info &&
    person.info.toLowerCase().includes(term);
  const yearMatch =
    (person.birthYear?.toString().includes(term) || false) ||
    (person.deathYear?.toString().includes(term) || false);
  return nameMatch || infoMatch || yearMatch;
};

const BinaryTreeNode = ({
  person,
  searchTerm,
  searchInInfo,
}: BinaryTreeNodeProps) => {
  const children = person.children || [];
  const displayedChildren = children;

  const matched = isMatch(person, searchTerm, searchInInfo);

  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div
        className={`bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 min-w-[160px] text-center transition-colors ${
          matched ? 'ring-2 ring-blue-400 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center justify-center mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 overflow-hidden mr-2">
            <span>
              {person.name && person.name.length > 0 ? (
                person.name.charAt(0)
              ) : (
                <UserIcon className="h-4 w-4 text-blue-600" />
              )}
            </span>
          </div>
          <span className="font-medium text-gray-800 text-sm">
            <span
              dangerouslySetInnerHTML={{
                __html: searchTerm
                  ? highlightMatch(person.name, searchTerm)
                  : person.name,
              }}
            />
          </span>
        </div>
        {person.info && (
          <p className="text-xs text-gray-600 line-clamp-2">
            <span
              dangerouslySetInnerHTML={{
                __html:
                  searchTerm && searchInInfo
                    ? highlightMatch(person.info, searchTerm)
                    : person.info,
              }}
            />
          </p>
        )}
        {(person.birthYear || person.deathYear) && (
          <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mt-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {person.birthYear}
              {person.birthYear && person.deathYear && ' - '}
              {person.deathYear &&
                (person.birthYear
                  ? person.deathYear
                  : ` - ${person.deathYear}`)}
            </span>
          </div>
        )}
      </div>

      {/* Connector to children */}
      {displayedChildren.length > 0 && (
        <>
          {/* Vertical line from parent to horizontal connector */}
          <div className="h-6 w-px bg-gray-300" />
          {/* Children with vertical connectors */}
          <div className="flex justify-center items-start gap-10">
            {displayedChildren.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line down to child node */}
                <div className="h-6 w-px bg-gray-300" />
                <BinaryTreeNode
                  person={child}
                  searchTerm={searchTerm}
                  searchInInfo={searchInInfo}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function BinaryTreeView({
  data,
  searchTerm,
  searchInInfo,
}: BinaryTreeViewProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2, z + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.4, z - 0.1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);


  const rootPeople = useMemo(
    () => data.generations[0]?.people || [],
    [data.generations]
  );

  if (!rootPeople.length) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          Chưa có dữ liệu gia phả để hiển thị sơ đồ cây nhị phân.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Sơ đồ cây (hỗ trợ nhiều nhánh)
        </h2>
        {/* Zoom controls */}
        <div className="flex flex-wrap justify-end mb-4 gap-2 text-xs text-gray-600 items-center">
          <button
            type="button"
            onClick={handleZoomOut}
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Thu nhỏ -
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            100%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Phóng to +
          </button>
          <div className="flex items-center gap-2 ml-2">
            <input
              type="range"
              min={40}
              max={200}
              step={10}
              value={zoom * 100}
              onChange={(e) =>
                setZoom(
                  Math.min(2, Math.max(0.4, Number(e.target.value) / 100))
                )
              }
              className="w-32 accent-blue-500"
            />
            <span className="self-center w-12 text-right">
              {(zoom * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        {/* Scroll & zoom area with pan via scrollbars, zoom via transform */}
        <div
          className="overflow-auto border border-gray-100 rounded-md max-h-[70vh] tree-scroll"
        >
          <div
            className="flex flex-col items-center gap-8 py-6 min-w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            {rootPeople.map((person) => (
              <BinaryTreeNode
                key={person.id}
                person={person}
                searchTerm={searchTerm}
                searchInInfo={searchInInfo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


