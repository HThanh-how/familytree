"use client";

import { useMemo } from 'react';
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
  const displayedChildren = children.slice(0, 2);
  const extraChildrenCount = children.length > 2 ? children.length - 2 : 0;

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
        {extraChildrenCount > 0 && (
          <p className="mt-1 text-[11px] text-gray-500 italic">
            … và {extraChildrenCount} người con khác
          </p>
        )}
      </div>

      {/* Connector to children */}
      {displayedChildren.length > 0 && (
        <>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex justify-center gap-6">
            {displayedChildren.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-4 w-px bg-gray-300" />
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
          Sơ đồ cây nhị phân (tối đa 2 nhánh mỗi nút)
        </h2>
        <div className="overflow-x-auto">
          <div className="flex flex-col items-center gap-8">
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


