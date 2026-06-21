import { Users, UserCheck, UserX, Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { LangType, TRANSLATIONS } from '../utils/lang';

interface StatsGridProps {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  onQuickAddMember: () => void;
  onQuickAddTransaction: () => void;
}

export function formatRupiah(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID');
}

export default function StatsGrid({
  totalMembers,
  activeMembers,
  inactiveMembers,
  balance,
  totalIncome,
  totalExpense,
  onQuickAddMember,
  onQuickAddTransaction,
}: StatsGridProps) {
  const activeLang = ((typeof localStorage !== 'undefined' ? localStorage.getItem('isoki_lang') : 'ID') as LangType) || 'ID';
  const t = TRANSLATIONS[activeLang];

  return (
    <div className="space-y-6">
      {/* Quick Action Panels & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111112] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[150%] bg-[#bef264]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold font-sans text-white">
            {activeLang === 'ID' ? 'Selamat Datang, Admin Isoki Matchday 👋' : 'Welcome, Admin Isoki Matchday 👋'}
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-sans">
            {activeLang === 'ID' 
              ? 'Kelola roster pemain, data kehadiran, serta pembukuan iuran tim secara realtime.' 
              : 'Manage player rosters, live presence, and team fee contributions in real-time.'}
          </p>
        </div>
        
        {/* Quick action buttons */}
        <div id="stats-quick-actions" className="flex flex-wrap items-center gap-2 relative z-10 leading-none">
          <button
            onClick={onQuickAddMember}
            className="flex items-center gap-2 px-5 py-3 bg-[#bef264] hover:bg-brand-hover text-black font-extrabold rounded-xl text-[11px] uppercase tracking-wider shadow-md shadow-[#bef264]/10 cursor-pointer transition-colors"
            style={{ backgroundColor: 'var(--brand-color)' }}
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            {t.quickAddMem}
          </button>
          
          <button
            onClick={onQuickAddTransaction}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white/90 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4 text-[#bef264]" style={{ color: 'var(--brand-color)' }} />
            {t.quickAddTx}
          </button>
        </div>
      </div>

      {/* Consolidated Master columns for Members and Finances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Informasi Roster & Keanggotaan */}
        <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Roster & Keanggotaan</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-sans">{totalMembers}</span>
              <span className="text-xs text-white/40 font-mono uppercase font-semibold">{t.totalRoster}</span>
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              {activeLang === 'ID' ? 'Jumlah pemain terdaftar aktif di dalam klub' : 'Number of active players registered in the club'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/5">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400">{t.active}</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">{activeMembers}</span>
              <span className="text-[9px] text-white/30 block mt-0.5">
                {activeLang === 'ID' ? 'Siap Bermain' : 'Ready to Play'}
              </span>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">{t.inactive}</span>
              </div>
              <span className="text-lg font-bold text-white/60 font-mono">{inactiveMembers}</span>
              <span className="text-[9px] text-white/30 block mt-0.5">
                {activeLang === 'ID' ? 'Nonaktif' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Kolom Informasi Keuangan & Kas */}
        <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Status Keuangan Isoki</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3.5xl font-black font-sans text-[#bef264]" style={{ color: 'var(--brand-color)' }}>{formatRupiah(balance)}</span>
              <span className="text-xs text-white/40 font-mono uppercase font-semibold">{t.netBalance}</span>
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              {activeLang === 'ID' ? 'Sisa dana kas bersih tim saat ini' : 'Remaining net balance of the team'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#bef264] block mb-1" style={{ color: 'var(--brand-color)' }}>✓ {t.income}</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono block truncate">{formatRupiah(totalIncome)}</span>
              <span className="text-[9px] text-white/30 block mt-0.5">
                {activeLang === 'ID' ? 'Uang Masuk' : 'Total Revenue'}
              </span>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 block mb-1">✗ {t.expense}</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono block truncate">{formatRupiah(totalExpense)}</span>
              <span className="text-[9px] text-white/30 block mt-0.5">
                {activeLang === 'ID' ? 'Kas Keluar' : 'Total Spent'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
