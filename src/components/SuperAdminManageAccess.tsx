import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, AlertCircle, Loader, KeySquare, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AllowedAdmin = {
  id?: string;
  admin_username: string;
  club_id: string;
  active: boolean;
};

type ClubRow = {
  id: string;
  abbreviation: string;
  name: string;
};

interface SuperAdminManageAccessProps {
  lang: 'ID' | 'EN';
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function SuperAdminManageAccess({ lang }: SuperAdminManageAccessProps) {
  const isID = lang === 'ID';

  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [allowedAdmins, setAllowedAdmins] = useState<AllowedAdmin[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [adminUsername, setAdminUsername] = useState('');
  const [clubId, setClubId] = useState('');
  const [active, setActive] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [clubsRes, allowedRes] = await Promise.all([
        supabase.from('clubs').select('id, abbreviation, name').order('created_at', { ascending: false }),
        supabase.from('allowed_admins').select('*').order('created_at', { ascending: false }),
      ]);

      if (clubsRes.error) throw clubsRes.error;
      if (allowedRes.error) throw allowedRes.error;

      setClubs((clubsRes.data || []) as any);
      setAllowedAdmins((allowedRes.data || []) as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const canAdd = useMemo(() => {
    return adminUsername.trim().length > 0 && clubId.trim().length > 0;
  }, [adminUsername, clubId]);

  const handleAddOrReplace = async () => {
    setError('');

    try {
      // Enforce: one admin_username -> exactly one club_id
      // Strategy: deactivate any existing rows for this admin_username, then insert a new active mapping.
      const username = adminUsername.trim();
      const nextClubId = clubId.trim();

      const { error: deactError } = await supabase
        .from('allowed_admins')
        .update({ active: false })
        .eq('admin_username', username);

      if (deactError) throw deactError;

      const { error: insertError } = await supabase
        .from('allowed_admins')
        .insert({
          admin_username: username,
          club_id: nextClubId,
          active: active === true,
        });

      if (insertError) throw insertError;

      setAdminUsername('');
      setClubId('');
      setActive(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleDeactivate = async (row: AllowedAdmin) => {
    setError('');
    if (!row.admin_username) return;
    try {
      const { error: updError } = await supabase
        .from('allowed_admins')
        .update({ active: false })
        .eq('admin_username', row.admin_username)
        .eq('club_id', row.club_id);

      if (updError) throw updError;

      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  // Group active mapping by admin
  const activeMappings = useMemo(() => {
    const active = allowedAdmins.filter((x) => x.active);
    // Ensure uniqueness: if multiple active rows accidentally exist, keep the first
    const byAdmin: Record<string, AllowedAdmin> = {};
    for (const row of active) {
      if (!byAdmin[row.admin_username]) byAdmin[row.admin_username] = row;
    }
    return Object.values(byAdmin);
  }, [allowedAdmins]);

  const clubNameById = useMemo(() => {
    const m: Record<string, ClubRow> = {};
    clubs.forEach((c) => (m[c.id] = c));
    return m;
  }, [clubs]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111112] border border-white/5 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#bef264]" />
              {isID ? 'Super Admin: Kelola Akses Admin Tim' : 'Super Admin: Manage Admin Access'}
            </h3>
            <p className="text-xs text-white/40 mt-1 max-w-xl leading-relaxed">
              {isID
                ? 'Aturan: setiap admin_username hanya boleh mengelola maksimal 1 tim (1 club_id) dalam keadaan active.'
                : 'Rule: each admin_username can manage max 1 team (1 club_id) in active state.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Users className="w-4 h-4" />
            <span>
              {isID ? 'Active Admin:' : 'Active Admin:'} {activeMappings.length}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Add mapping */}
      <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <KeySquare className="w-4 h-4 text-[#bef264]" />
          {isID ? 'Tambah / Update Akses Admin' : 'Add / Update Access'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">{isID ? 'admin_username' : 'admin_username'}</label>
            <input
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-[#bef264]"
              placeholder={isID ? 'contoh: GBMFC' : 'e.g. GBMFC'}
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">{isID ? 'Tim (club)' : 'Team (club)'}</label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-lg text-white text-sm focus:outline-none focus:border-[#bef264] cursor-pointer"
            >
              <option value="">{isID ? '-- Pilih Club --' : '-- Select Club --'}</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.abbreviation} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-mono text-white/40 uppercase mb-2">{isID ? 'Status' : 'Status'}</label>
            <label className="flex items-center gap-2 text-xs text-white/70 bg-[#0a0a0b] border border-white/5 rounded-lg px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-[#bef264]"
              />
              {isID ? 'Aktif' : 'Active'}
            </label>

            <button
              onClick={handleAddOrReplace}
              disabled={!canAdd}
              className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#bef264] hover:bg-brand-hover text-black font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isID ? 'Simpan Mapping' : 'Save Mapping'}
            </button>
          </div>
        </div>

        <div className="text-[10px] text-white/30 font-mono leading-relaxed">
          {isID
            ? 'Catatan: saat menyimpan mapping, semua baris active lama untuk admin_username ini akan dinonaktifkan, lalu baris active baru ditambahkan.'
            : 'Note: when saving, all old active rows for this admin_username will be deactivated, then a new active row is inserted.'}
        </div>
      </div>

      {/* Active mappings table */}
      <div className="bg-[#111112] border border-white/5 rounded-3xl p-6">
        <h4 className="text-sm font-bold text-white mb-4">{isID ? 'Daftar Akses Aktif' : 'Active Access List'}</h4>

        {activeMappings.length === 0 ? (
          <div className="text-xs text-white/40 text-center py-10">
            {isID ? 'Belum ada mapping active.' : 'No active mappings yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full border-collapse">
              <thead>
                <tr className="text-[9px] text-white/40 uppercase tracking-widest border-b border-white/5">
                  <th className="text-left py-4 px-3 font-mono">admin_username</th>
                  <th className="text-left py-4 px-3 font-mono">club</th>
                  <th className="text-left py-4 px-3 font-mono">club_id</th>
                  <th className="text-right py-4 px-3 font-mono">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activeMappings.map((row) => {
                  const club = clubNameById[row.club_id];
                  return (
                    <tr key={`${row.admin_username}-${row.club_id}`} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 px-3 text-xs text-[#bef264] font-mono font-bold whitespace-nowrap">{row.admin_username}</td>
                      <td className="py-4 px-3 text-xs text-white/80 font-sans whitespace-nowrap">{club ? `${club.abbreviation} - ${club.name}` : '-'}</td>
                      <td className="py-4 px-3 text-xs text-white/50 font-mono whitespace-nowrap">{row.club_id}</td>
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => handleDeactivate(row)}
                          className="inline-flex items-center gap-2 justify-end px-3 py-2 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isID ? 'Nonaktifkan' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

