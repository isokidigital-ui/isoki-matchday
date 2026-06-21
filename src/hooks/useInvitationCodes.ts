import { supabase } from '../lib/supabase';

export interface InvitationCode {
  id: string;
  code: string;
  clubId: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export const useInvitationCodes = () => {
  // Validate invitation code
  const validateCode = async (code: string): Promise<{ success: boolean; message: string; clubId?: string }> => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !data) {
        return { success: false, message: 'Kode undangan tidak valid' };
      }

      const invitationCode = data as any;

      // Check if active
      if (!invitationCode.is_active) {
        return { success: false, message: 'Kode undangan sudah tidak aktif' };
      }

      // Check if expired
      if (invitationCode.expires_at) {
        const expiresAt = new Date(invitationCode.expires_at);
        if (expiresAt < new Date()) {
          return { success: false, message: 'Kode undangan sudah expired' };
        }
      }

      // Check if max uses exceeded
      if (invitationCode.used_count >= invitationCode.max_uses) {
        return { success: false, message: 'Kode undangan sudah mencapai batas penggunaan' };
      }

      return { success: true, message: 'Kode valid', clubId: invitationCode.club_id };
    } catch (err) {
      console.error('Validate code error:', err);
      return { success: false, message: 'Gagal validasi kode' };
    }
  };

  // Mark code as used (increment used_count)
  const markCodeAsUsed = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data: codeData, error: fetchError } = await supabase
        .from('invitation_codes')
        .select('id, used_count, max_uses')
        .eq('code', code.toUpperCase())
        .single();

      if (fetchError || !codeData) {
        return { success: false, message: 'Kode tidak ditemukan' };
      }

      const { error: updateError } = await supabase
        .from('invitation_codes')
        .update({ used_count: (codeData as any).used_count + 1 })
        .eq('code', code.toUpperCase());

      if (updateError) {
        return { success: false, message: 'Gagal memperbarui kode' };
      }

      // Auto deactivate if max uses reached
      if ((codeData as any).used_count + 1 >= (codeData as any).max_uses) {
        await supabase
          .from('invitation_codes')
          .update({ is_active: false })
          .eq('code', code.toUpperCase());
      }

      return { success: true, message: 'Kode berhasil digunakan' };
    } catch (err) {
      console.error('Mark code as used error:', err);
      return { success: false, message: 'Gagal menandai kode sebagai digunakan' };
    }
  };

  // Generate new invitation code
  const generateCode = async (clubId: string, maxUses: number = 1, expiresInDays?: number): Promise<{ success: boolean; message: string; code?: string }> => {
    try {
      // Generate random code: ISK-XXXXX-XXXXX format
      const code = `ISK-${Math.random().toString(36).substr(2, 5).toUpperCase()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      let expiresAt = null;
      if (expiresInDays) {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + expiresInDays);
        expiresAt = expireDate.toISOString();
      }

      const { error } = await supabase
        .from('invitation_codes')
        .insert({
          code,
          club_id: clubId,
          max_uses: maxUses,
          expires_at: expiresAt,
          created_by: clubId, // For now, link to club instead of user
          is_active: true
        });

      if (error) {
        return { success: false, message: 'Gagal membuat kode undangan' };
      }

      return { success: true, message: 'Kode berhasil dibuat', code };
    } catch (err) {
      console.error('Generate code error:', err);
      return { success: false, message: 'Gagal membuat kode undangan' };
    }
  };

  // Get all codes for a club
  const getCodesByClub = async (clubId: string): Promise<{ success: boolean; codes: InvitationCode[]; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, codes: [], message: 'Gagal mengambil kode undangan' };
      }

      const codes = (data || []).map((item: any) => ({
        id: item.id,
        code: item.code,
        clubId: item.club_id,
        maxUses: item.max_uses,
        usedCount: item.used_count,
        isActive: item.is_active,
        expiresAt: item.expires_at,
        createdAt: item.created_at
      }));

      return { success: true, codes, message: 'Kode berhasil diambil' };
    } catch (err) {
      console.error('Get codes error:', err);
      return { success: false, codes: [], message: 'Gagal mengambil kode undangan' };
    }
  };

  // Deactivate a code
  const deactivateCode = async (codeId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase
        .from('invitation_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) {
        return { success: false, message: 'Gagal menonaktifkan kode' };
      }

      return { success: true, message: 'Kode berhasil dinonaktifkan' };
    } catch (err) {
      console.error('Deactivate code error:', err);
      return { success: false, message: 'Gagal menonaktifkan kode' };
    }
  };

  return {
    validateCode,
    markCodeAsUsed,
    generateCode,
    getCodesByClub,
    deactivateCode
  };
};
