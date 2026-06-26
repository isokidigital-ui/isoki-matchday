import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ClubConfig } from '../types';
import { simpleHash } from '../utils/auth-helper';

export interface AuthResponse {
  success: boolean;
  message: string;
  clubConfig?: ClubConfig;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register club admin
   */
  const registerClub = useCallback(async (
    clubName: string,
    abbreviation: string,
    adminUsername: string,
    adminPassword: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const passwordHash = simpleHash(adminPassword);

      const { data, error: insertError } = await supabase
        .from('clubs')
        .insert([
          {
            name: clubName,
            abbreviation: abbreviation.toUpperCase(),
            admin_username: adminUsername,
            admin_password_hash: passwordHash,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return {
          success: false,
          message: insertError.message,
        };
      }

      return {
        success: true,
        message: 'Club registered successfully',
        clubConfig: {
          name: data.name,
          abbreviation: data.abbreviation,
          logoUrl: data.logo_url,
          themeColor: data.theme_color,
          themeColorHover: data.theme_color_hover,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login admin
   */
  const loginClub = useCallback(async (
    adminUsername: string,
    adminPassword: string
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('clubs')
        .select('*')
        .eq('admin_username', adminUsername)
        .single();

      if (queryError || !data) {
        setError('Club not found');
        return {
          success: false,
          message: 'Club not found',
        };
      }

      const passwordHash = simpleHash(adminPassword);
      if (data.admin_password_hash !== passwordHash) {
        setError('Invalid password');
        return {
          success: false,
          message: 'Invalid password',
        };
      }

      // Access control: only allow whitelisted admin_username to access exactly one club (tim)
      // Default whitelist table: allowed_admins(admin_username, club_id, active)
      const { data: allowedRow, error: allowedError } = await supabase
        .from('allowed_admins')
        .select('admin_username, club_id, active')
        .eq('admin_username', adminUsername)
        .eq('club_id', data.id)
        .eq('active', true)
        .maybeSingle();

      if (allowedError) {
        setError(allowedError.message);
        return {
          success: false,
          message: allowedError.message,
        };
      }

      if (!allowedRow) {
        setError('Akses ditolak: admin ini tidak punya izin untuk tim ini');
        return {
          success: false,
          message: 'Akses ditolak: admin ini tidak punya izin untuk tim ini',
        };
      }

      return {
        success: true,
        message: 'Login successful',
        clubConfig: {
          name: data.name,
          abbreviation: data.abbreviation,
          logoUrl: data.logo_url,
          themeColor: data.theme_color,
          themeColorHover: data.theme_color_hover,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update club profile
   */
  const updateClubProfile = useCallback(async (
    clubId: string,
    updates: Partial<ClubConfig>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('clubs')
        .update({
          logo_url: updates.logoUrl,
          theme_color: updates.themeColor,
          theme_color_hover: updates.themeColorHover,
        })
        .eq('id', clubId);

      if (updateError) {
        setError(updateError.message);
        return { success: false, message: updateError.message };
      }

      return { success: true, message: 'Profile updated' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    registerClub,
    loginClub,
    updateClubProfile,
  };
};
