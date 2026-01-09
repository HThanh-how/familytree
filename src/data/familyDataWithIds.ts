'use client';

import useSWR from 'swr';
import { FamilyData } from '../types/family';

// Default empty family data
const defaultFamilyData: FamilyData = {
  generations: []
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

// Hook for fetching family data on client
export function useFamilyData(): {
  data: FamilyData;
  loading: boolean;
  error: string | null
} {
  const { data, error, isLoading } = useSWR<FamilyData>('/api/family-data', fetcher, {
    revalidateOnFocus: false, // Don't revalidate on window focus for static-ish data
    revalidateIfStale: false, // Don't revalidate if we have cache, unless manually mutated
    // actually family data might change, so let's keep default revalidation-on-mount behavior 
    // but maybe disable aggressive polish
    dedupingInterval: 60000, // 1 minute dedupe
  });

  return {
    data: data || defaultFamilyData,
    loading: isLoading,
    error: error ? error.message : null
  };
}

// Export default data for optional usage
export const familyDataWithIds = defaultFamilyData; 