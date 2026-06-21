import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ClubConfig } from '../types';

export const useClub = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get club by abbreviation
   */
  const getClubByAbbreviation = useCallback(async (abbreviation: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('clubs')
        .select('*')
        .eq('abbreviation', abbreviation.toUpperCase())
        .single();

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: null };
      }

      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all clubs
   */
  const getAllClubs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getClubByAbbreviation,
    getAllClubs,
  };
};
