import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Matchday, MatchdayAttendance } from '../types';

export const useMatchdays = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all matchdays for a club
   */
  const getMatchdays = useCallback(async (clubId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('matchdays')
        .select('*')
        .eq('club_id', clubId)
        .order('tanggal', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: [] };
      }

      const matchdays: Matchday[] = (data || []).map(m => ({
        id: m.id,
        tanggal: m.tanggal,
        lokasi: m.lokasi,
        opponent: m.opponent,
        jenisPertandingan: m.jenis_pertandingan,
      }));

      return { success: true, data: matchdays };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get matchday with attendance details
   */
  const getMatchdayWithAttendance = useCallback(async (matchdayId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('matchday_attendance')
        .select(`
          *,
          member:members(*)
        `)
        .eq('matchday_id', matchdayId);

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: [] };
      }

      const attendance: MatchdayAttendance[] = (data || []).map(a => ({
        memberId: a.member_id,
        kodeMember: a.member?.kode_member || '',
        nama: a.member?.nama || '',
        posisi: a.member?.posisi || 'Player',
        hadir: a.hadir,
        bayar: a.bayar,
        jumlahBayar: a.jumlah_bayar,
      }));

      return { success: true, data: attendance };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new matchday
   */
  const createMatchday = useCallback(async (
    clubId: string,
    matchday: Omit<Matchday, 'id'>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('matchdays')
        .insert([
          {
            club_id: clubId,
            tanggal: matchday.tanggal,
            lokasi: matchday.lokasi,
            opponent: matchday.opponent,
            jenis_pertandingan: matchday.jenisPertandingan,
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
      const message = err instanceof Error ? err.message : 'Create failed';
      setError(message);
      return { success: false, data: null };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update matchday attendance for a member
   */
  const updateAttendance = useCallback(async (
    matchdayId: string,
    memberId: string,
    hadir: boolean,
    bayar: boolean,
    jumlahBayar: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // First check if attendance record exists
      const { data: existingData, error: queryError } = await supabase
        .from('matchday_attendance')
        .select('id')
        .eq('matchday_id', matchdayId)
        .eq('member_id', memberId)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // 'PGRST116' is "no rows" error
        setError(queryError.message);
        return { success: false };
      }

      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('matchday_attendance')
          .update({
            hadir,
            bayar,
            jumlah_bayar: jumlahBayar,
          })
          .eq('id', existingData.id);

        if (updateError) {
          setError(updateError.message);
          return { success: false };
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('matchday_attendance')
          .insert([
            {
              matchday_id: matchdayId,
              member_id: memberId,
              hadir,
              bayar,
              jumlah_bayar: jumlahBayar,
            },
          ]);

        if (insertError) {
          setError(insertError.message);
          return { success: false };
        }
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
   * Delete matchday
   */
  const deleteMatchday = useCallback(async (matchdayId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('matchdays')
        .delete()
        .eq('id', matchdayId);

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

  return {
    isLoading,
    error,
    getMatchdays,
    getMatchdayWithAttendance,
    createMatchday,
    updateAttendance,
    deleteMatchday,
  };
};
