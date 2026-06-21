import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

export const useTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get all transactions for a club
   */
  const getTransactions = useCallback(async (clubId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('club_id', clubId)
        .order('tanggal', { ascending: false });

      if (queryError) {
        setError(queryError.message);
        return { success: false, data: [] };
      }

      const transactions: Transaction[] = (data || []).map(t => ({
        id: t.id,
        tanggal: t.tanggal,
        deskripsi: t.deskripsi,
        jumlah: t.jumlah,
        tipe: t.tipe,
        kategori: t.kategori,
        kodeMember: t.kode_member,
      }));

      return { success: true, data: transactions };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, data: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add new transaction
   */
  const addTransaction = useCallback(async (clubId: string, transaction: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            club_id: clubId,
            tanggal: transaction.tanggal,
            deskripsi: transaction.deskripsi,
            jumlah: transaction.jumlah,
            tipe: transaction.tipe,
            kategori: transaction.kategori,
            kode_member: transaction.kodeMember,
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
   * Update transaction
   */
  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<Transaction>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          tanggal: updates.tanggal,
          deskripsi: updates.deskripsi,
          jumlah: updates.jumlah,
          tipe: updates.tipe,
          kategori: updates.kategori,
          kode_member: updates.kodeMember,
        })
        .eq('id', transactionId);

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
   * Delete transaction
   */
  const deleteTransaction = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

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
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
