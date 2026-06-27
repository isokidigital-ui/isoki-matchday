import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useClubOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOnboarded = useCallback(async (clubId: string, onboarded: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('clubs')
        .update({ onboarded })
        .eq('id', clubId);

      if (updateError) {
        setError(updateError.message);
        return { success: false as const, message: updateError.message };
      }

      return { success: true as const };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update onboarding status';
      setError(message);
      return { success: false as const, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, setOnboarded };
};

