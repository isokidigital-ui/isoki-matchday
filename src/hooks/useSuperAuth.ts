import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { simpleHash } from '../utils/auth-helper';

export interface SuperAuthResponse {
  success: boolean;
  message: string;
}

/**
 * Super admin auth (khusus portal admin utama)
 *
 * Flow:
 * - Validate username/password against table `super_admins`
 * - Enforce `active=true`
 */
export const useSuperAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginSuperAdmin = useCallback(async (
    username: string,
    password: string
  ): Promise<SuperAuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (queryError) {
        setError(queryError.message);
        return { success: false, message: queryError.message };
      }

      if (!data || data.active !== true) {
        const msg = 'Akses ditolak: super admin tidak aktif atau tidak ditemukan';
        setError(msg);
        return { success: false, message: msg };
      }

      const passwordHash = simpleHash(password);
      if (data.password_hash !== passwordHash) {
        const msg = 'Password super admin salah';
        setError(msg);
        return { success: false, message: msg };
      }

      return { success: true, message: 'Login super admin berhasil' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login super admin gagal';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    loginSuperAdmin,
  };
};

