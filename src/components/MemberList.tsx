import { useState } from 'react';
import { Search, Plus, Pencil, Ban, CheckCircle2, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Member, Position } from '../types';

interface MemberListProps {
  members: Member[];
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeactivateMember: (memberCode: string) => void;
  onToggleStatus: (memberCode: string) => void;
  onBackToDashboard?: () => void;
}

export default function MemberList({
  members,
  onAddMember,
  onEditMember,
  onDeactivateMember,
  onToggleStatus,
  onBackToDashboard,
}: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Helper to get initials
  const getInitials = (name: string): string => {
    if (!name) return '??';
    const split = name.trim().split(' ');
    if (split.length >= 2) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filter members based on search and selected attributes
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.kodeMember.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.noHp.includes(searchQuery);

    const matchesPosition = filterPosition === 'All' || member.posisi === filterPosition;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && member.aktif) ||
      (filterStatus === 'Inactive' && !member.aktif);

    return matchesSearch && matchesPosition && matchesStatus;
  });

  return (
    <div className="bg-[#111112] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
      {/* Header Controls */}
      <div className="p-6 sm:p-8 border-b border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white rounded-xl cursor-pointer transition-colors"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold font-sans text-white tracking-tight">Daftar Member</h3>
              <p className="text-xs text-white/50 mt-1 font-sans">Kelola daftar roster & status keaktifan pemain.</p>
            </div>
          </div>
          
          <button
            onClick={onAddMember}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#bef264] hover:bg-brand-hover text-black font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-[#bef264]/10 shrink-0 transition-colors"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Tambah Member
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, kode, atau no HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-neutral-200 placeholder-white/20 focus:outline-none focus:border-[#bef264] text-xs transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Position selector */}
          <div className="sm:col-span-3">
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white/50 focus:outline-none focus:border-[#bef264] focus:text-white transition-colors cursor-pointer"
            >
              <option value="All">Semua Posisi</option>
              <option value="Player">Hanya Player</option>
              <option value="Keeper">Hanya Kiper (GK)</option>
            </select>
          </div>

          {/* Status selector */}
          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white/50 focus:outline-none focus:border-[#bef264] focus:text-white transition-colors cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="Active">Status: Aktif</option>
              <option value="Inactive">Status: Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid displays - Empty State */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 text-center bg-[#111112]">
          <AlertTriangle className="h-8 w-8 text-[#bef264]/70 mx-auto mb-3" />
          <p className="text-sm text-white/70 font-semibold font-sans">Tidak ada member ditemukan</p>
          <p className="text-xs text-white/30 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
        </div>
      ) : (
        <>
          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto bg-[#111112]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#18181b] text-white/40 font-mono text-[9px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-semibold">Kode Member</th>
                  <th className="px-6 py-4 font-semibold">Nama Player</th>
                  <th className="px-6 py-4 font-semibold">No. HP</th>
                  <th className="px-6 py-4 font-semibold text-center">Posisi</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Kode Member */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#bef264] font-bold">
                      {member.kodeMember}
                    </td>
                    {/* Nama with Avatar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center font-mono text-[10px] font-bold text-white/75 overflow-hidden shrink-0 shadow-inner">
                          {member.fotoProfil ? (
                            <img src={member.fotoProfil} alt={member.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            getInitials(member.nama)
                          )}
                        </div>
                        <span className="text-xs font-semibold text-white/90 font-sans block">{member.nama}</span>
                      </div>
                    </td>
                    {/* No HP */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-white/50">
                      {member.noHp || '-'}
                    </td>
                    {/* Posisi Badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase ${
                        member.posisi === 'Player'
                          ? 'bg-neutral-800 text-white/80 border border-white/5'
                          : 'bg-purple-950/20 text-purple-400 border border-purple-500/10'
                      }`}>
                        {member.posisi}
                      </span>
                    </td>
                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                        member.aktif
                          ? 'bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/10'
                          : 'bg-white/5 text-white/30 border border-white/5'
                      }`}>
                        {member.aktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    {/* Aksi icons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 text-white/50">
                        {/* Reactivate button standard toggle */}
                        {!member.aktif && (
                          <button
                            onClick={() => onToggleStatus(member.kodeMember)}
                            className="p-2 bg-white/5 hover:bg-[#bef264]/10 border border-white/5 text-[#bef264] rounded-xl transition-all cursor-pointer"
                            title="Aktifkan Kembali"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditMember(member)}
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl transition-all cursor-pointer"
                          title="Edit Member"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {member.aktif && (
                          <button
                            onClick={() => onDeactivateMember(member.kodeMember)}
                            className="p-2 bg-white/5 hover:bg-rose-500/10 border border-white/5 text-rose-450 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                            title="Nonaktifkan"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: High density compact list */}
          <div className="block md:hidden divide-y divide-white/5 bg-[#111112]">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-white/[0.01] active:bg-white/[0.02] transition-colors"
              >
                {/* Visual Avatar & Profile names left side */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center font-mono text-xs font-bold text-white/75 shrink-0 select-none">
                    {member.fotoProfil ? (
                      <img src={member.fotoProfil} alt={member.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      getInitials(member.nama)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 leading-none">
                      <span className="text-xs font-bold text-white truncate max-w-[120px] font-sans">
                        {member.nama}
                      </span>
                      <span className="text-[9px] font-mono text-[#bef264] font-semibold">
                        {member.kodeMember}
                      </span>
                    </div>
                    {/* No HP below name */}
                    <p className="text-[10px] font-mono text-white/40 mt-1 truncate">
                      {member.noHp || 'No HP -'}
                    </p>
                    
                    {/* Tiny responsive badges below No HP */}
                    <div className="flex items-center gap-1.5 mt-1.5 leading-none">
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider ${
                        member.posisi === 'Player'
                          ? 'bg-neutral-800 text-white/70'
                          : 'bg-purple-950 text-purple-400'
                      }`}>
                        {member.posisi}
                      </span>
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider ${
                        member.aktif
                          ? 'bg-[#bef264]/10 text-[#bef264]'
                          : 'bg-white/5 text-white/30'
                      }`}>
                        {member.aktif ? 'Aktif' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions: sized min 40x40px for responsive mobile touch */}
                <div className="flex items-center gap-2 shrink-0">
                  {!member.aktif && (
                    <button
                      onClick={() => onToggleStatus(member.kodeMember)}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-[#bef264]/10 border border-white/5 text-[#bef264] rounded-xl transition-all cursor-pointer"
                      title="Aktifkan Kembali"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEditMember(member)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl transition-all cursor-pointer"
                    title="Edit Member"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {member.aktif && (
                    <button
                      onClick={() => onDeactivateMember(member.kodeMember)}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-rose-500/10 border border-white/5 text-rose-450 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                      title="Nonaktifkan"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
