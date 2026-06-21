import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Member } from '../types';

export const useMembers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all members for a club
   */
  const getMembers = useCallback(async (clubId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('members')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: [] };
      }

      const members: Member[] = (data || []).map(m => ({
        id: m.id,
        kodeMember: m.kode_member,
        nama: m.nama,
        noHp: m.no_hp,
        posisi: m.posisi,
        aktif: m.aktif,
        fotoProfil: m.foto_profil,
      }));

      return { success: true, data: members };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add new member
   */
  const addMember = useCallback(async (clubId: string, member: Omit<Member, 'id'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('members')
        .insert([
          {
            club_id: clubId,
            kode_member: member.kodeMember,
            nama: member.nama,
            no_hp: member.noHp,
            posisi: member.posisi,
            aktif: member.aktif,
            foto_profil: member.fotoProfil,
          },
        ])
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return { success: false, data: null };
      }

      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Add failed';
      setError(message);
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update member
   */
  const updateMember = useCallback(async (memberId: string, updates: Partial<Member>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          kode_member: updates.kodeMember,
          nama: updates.nama,
          no_hp: updates.noHp,
          posisi: updates.posisi,
          aktif: updates.aktif,
          foto_profil: updates.fotoProfil,
        })
        .eq('id', memberId);

      if (updateError) {
        setError(updateError.message);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete member
   */
  const deleteMember = useCallback(async (memberId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (deleteError) {
        setError(deleteError.message);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle member active status
   */
  const toggleMemberActive = useCallback(async (memberId: string, aktif: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('members')
        .update({ aktif })
        .eq('id', memberId);

      if (updateError) {
        setError(updateError.message);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getMembers,
    addMember,
    updateMember,
    deleteMember,
    toggleMemberActive,
  };
};
