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

      // NOTE: Map fields from Supabase to the app's Matchday type.
      // The current DB schema in this repo seems not fully aligned with src/types.ts Matchday.
      // To keep the app type-safe, we only fill the required fields with sane defaults.
      const matchdays: Matchday[] = (data || []).map((m: any) => ({
        id: String(m.id),
        tanggal: String(m.tanggal),
        waktuMulai: String(m.waktu_mulai ?? m.waktuMulai ?? '14:00'),
        waktuSelesai: String(m.waktu_selesai ?? m.waktuSelesai ?? '16:00'),
        namaMatchday: String(m.nama_matchday ?? m.namaMatchday ?? `Matchday`),
        lokasi: String(m.lokasi ?? ''),
        sewaLapangan: Number(m.sewa_lapangan ?? m.sewaLapangan ?? 0),
        airMinum: Number(m.air_minum ?? m.airMinum ?? 40000),
        parkir: Number(m.parkir ?? 25000),
        laundry: Number(m.laundry ?? 20000),
        qtyAirMinum: m.qty_air_minum != null ? Number(m.qty_air_minum) : undefined,
        hargaAirMinumPerDus: m.harga_air_minum_per_dus != null ? Number(m.harga_air_minum_per_dus) : undefined,
        qtyLaundryKg: m.qty_laundry_kg != null ? Number(m.qty_laundry_kg) : undefined,
        hargaLaundryPerKg: m.harga_laundry_per_kg != null ? Number(m.harga_laundry_per_kg) : undefined,
        sewaWasit: m.sewa_wasit != null ? Number(m.sewa_wasit) : undefined,
        tarifWasitPerJam: m.tarif_wasit_per_jam != null ? Number(m.tarif_wasit_per_jam) : undefined,
        durasiWasitJam: m.durasi_wasit_jam != null ? Number(m.durasi_wasit_jam) : undefined,
        fotografer: m.fotografer != null ? Number(m.fotografer) : undefined,
        tarifFotograferPerJam: m.tarif_fotografer_per_jam != null ? Number(m.tarif_fotografer_per_jam) : undefined,
        durasiFotograferJam: m.durasi_fotografer_jam != null ? Number(m.durasi_fotografer_jam) : undefined,
        videografer: m.videografer != null ? Number(m.videografer) : undefined,
        tarifVideograferPerJam: m.tarif_videografer_per_jam != null ? Number(m.tarif_videografer_per_jam) : undefined,
        durasiVideograferJam: m.durasi_videografer_jam != null ? Number(m.durasi_videografer_jam) : undefined,
        durasiJam: m.durasi_jam != null ? Number(m.durasi_jam) : 2,
        sewaPerJam: m.sewa_per_jam != null ? Number(m.sewa_per_jam) : undefined,
        customExpenseDeskripsi: m.custom_expense_deskripsi ?? undefined,
        customExpenseJumlah: m.custom_expense_jumlah != null ? Number(m.custom_expense_jumlah) : undefined,
        attendance: [],
        isSynced: Boolean(m.is_synced ?? m.isSynced ?? false),
        jenisMatch: m.jenis_match ?? m.jenisMatch ?? 'Latihan Internal',
        kategoriCabang: m.kategori_cabang ?? m.kategoriCabang ?? undefined,
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
            // These columns may not exist in current src/types.ts; keep insert minimal.
            // If you have matching columns in Supabase, map them accordingly.
            jenis_pertandingan: matchday.jenisMatch,


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
