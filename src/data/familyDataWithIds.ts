'use client';

import { useState, useEffect } from 'react';
import { FamilyData } from '../types/family';

// Default empty family data
const defaultFamilyData: FamilyData = {
  generations: []
};

// Hook for fetching family data on client
export function useFamilyData(): { 
  data: FamilyData; 
  loading: boolean; 
  error: string | null 
} {
  const [data, setData] = useState<FamilyData>(defaultFamilyData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch data from API endpoint
        const response = await fetch('/api/family-data');
        
        if (!response.ok) {
          throw new Error(`API returned error status: ${response.status}`);
        }
        
        const fetchedData = await response.json();
        setData(fetchedData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch family data:', err);
        setError('Tải dữ liệu gia phả thất bại, đang dùng dữ liệu mặc định');
        // On error, fall back to default data
        setData(defaultFamilyData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

// Export default data for optional usage
export const familyDataWithIds = defaultFamilyData; 