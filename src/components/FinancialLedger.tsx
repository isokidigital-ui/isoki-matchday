import { useState } from 'react';
import { 
  Search, Plus, Calendar, ArrowUpRight, ArrowDownRight, Tag, Trash2, 
  Filter, AlertCircle, RefreshCw, ArrowLeft, TrendingUp, TrendingDown, 
  BookOpen, Clock, Activity, CheckCircle2, ChevronRight, HelpCircle, Info, Wallet,
  ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { Transaction, Member, Matchday } from '../types';
import { FINANCIAL_CATEGORIES } from '../data';
import { formatRupiah } from './StatsGrid';

interface FinancialLedgerProps {
  transactions: Transaction[];
  members: Member[];
  matchdays: Matchday[];
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onBackToDashboard?: () => void;
  onSelectMatchday?: (id: string) => void;
}

// Reliable date operations (unaffected by timezone shifting)
function parseLocalDate(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function getWeekDetails(dateStr: string) {
  const d = parseLocalDate(dateStr);
  if (isNaN(d.getTime())) return null;
  
  const day = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diffToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const formattedMonday = `${String(monday.getDate()).padStart(2, '0')} ${months[monday.getMonth()]}`;
  const formattedSunday = `${String(sunday.getDate()).padStart(2, '0')} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
  
  // Calculate ISO Week
  const target = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const dayOffset = (yearStart.getDay() === 0 ? 6 : yearStart.getDay() - 1);
  const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + dayOffset + 1) / 7);
  
  return {
    weekNo,
    year: sunday.getFullYear(),
    startStr: monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0'),
    endStr: sunday.getFullYear() + '-' + String(sunday.getMonth() + 1).padStart(2, '0') + '-' + String(sunday.getDate()).padStart(2, '0'),
    label: `M-W${weekNo} (${formattedMonday} - ${formattedSunday})`,
    shortLabel: `Minggu W-${weekNo}`
  };
}

function getMonthDetails(dateStr: string) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0]);
  const monthIdx = parseInt(parts[1]) - 1;
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return {
    year,
    monthIdx,
    key: `${parts[0]}-${parts[1]}`,
    label: `${months[monthIdx]} ${year}`
  };
}

function isDateInCurrentWeek(dateStr: string) {
  const d = parseLocalDate(dateStr);
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = today.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
  
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), diffToMonday, 0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7, 0, 0, 0, 0);
  
  const txTime = d.getTime();
  return txTime >= startOfWeek.getTime() && txTime < endOfWeek.getTime();
}

export default function FinancialLedger({
  transactions,
  members,
  matchdays,
  onAddTransaction,
  onDeleteTransaction,
  onBackToDashboard,
  onSelectMatchday,
}: FinancialLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [pendingDeleteTx, setPendingDeleteTx] = useState<Transaction | null>(null);

  // Advanced filtration states based on user requirement: "seach by minggu atau bulan"
  const [expandedMatchdayId, setExpandedMatchdayId] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'All' | 'ThisWeek' | 'ThisMonth' | 'SpecificWeek' | 'SpecificMonth'>('All');
  const [chosenWeek, setChosenWeek] = useState<string>('All');
  const [chosenMonth, setChosenMonth] = useState<string>('All');
  const [showSyncExplainer, setShowSyncExplainer] = useState(true);

  // Helper to extract unique months from transactions
  const availableMonths = Array.from(new Set(transactions.map(t => {
    const m = getMonthDetails(t.tanggal);
    return m ? JSON.stringify(m) : '';
  }).filter(Boolean))).map(s => JSON.parse(s) as { key: string; label: string });

  // Helper to extract unique weeks from transactions
  const availableWeeks = Array.from(new Set(transactions.map(t => {
    const w = getWeekDetails(t.tanggal);
    return w ? JSON.stringify(w) : '';
  }).filter(Boolean))).map(s => JSON.parse(s) as { label: string; startStr: string; endStr: string });

  // Find member name by code
  const getMemberName = (code?: string): string => {
    if (!code) return '';
    const m = members.find((x) => x.kodeMember.toLowerCase() === code.toLowerCase());
    return m ? m.nama : code;
  };

  // Filter transactions dynamically based on all selections (search queries, types, categories, and periods)
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.kodeMember && tx.kodeMember.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'All' || tx.tipe === filterType;
    const matchesCategory = filterCategory === 'All' || tx.kategori === filterCategory;

    // Period Filtration matching logic
    let matchesPeriod = true;
    if (periodFilter === 'ThisWeek') {
      matchesPeriod = isDateInCurrentWeek(tx.tanggal);
    } else if (periodFilter === 'ThisMonth') {
      const m = getMonthDetails(tx.tanggal);
      const now = new Date();
      const nowMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      matchesPeriod = m ? m.key === nowMonthKey : false;
    } else if (periodFilter === 'SpecificWeek') {
      if (chosenWeek !== 'All') {
        const w = getWeekDetails(tx.tanggal);
        matchesPeriod = w ? w.label === chosenWeek : false;
      }
    } else if (periodFilter === 'SpecificMonth') {
      if (chosenMonth !== 'All') {
        const m = getMonthDetails(tx.tanggal);
        matchesPeriod = m ? m.key === chosenMonth : false;
      }
    }

    return matchesSearch && matchesType && matchesCategory && matchesPeriod;
  });

  // Calculate stats for current search context
  const totalSubIncome = filteredTransactions
    .filter((t) => t.tipe === 'Pemasukan')
    .reduce((a, b) => a + b.jumlah, 0);

  const totalSubExpense = filteredTransactions
    .filter((t) => t.tipe === 'Pengeluaran')
    .reduce((a, b) => a + b.jumlah, 0);

  // Group by category to build visual chart
  const categoryTotals: { [key: string]: number } = {};
  filteredTransactions.forEach((t) => {
    categoryTotals[t.kategori] = (categoryTotals[t.kategori] || 0) + t.jumlah;
  });

  const categoriesList = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  })).sort((a, b) => b.value - a.value);

  const maxCatValue = categoriesList[0]?.value || 1;


  // --- REPORT GENERATION METHODS ---

  // 2. Weekly summary calculator
  const getWeeklyReports = () => {
    const weeklyData: { [key: string]: { label: string; income: number; expense: number; txCount: number; rawWeek: any } } = {};
    
    transactions.forEach(tx => {
      const details = getWeekDetails(tx.tanggal);
      if (!details) return;
      const key = details.label;
      if (!weeklyData[key]) {
        weeklyData[key] = {
          label: key,
          income: 0,
          expense: 0,
          txCount: 0,
          rawWeek: details
        };
      }
      if (tx.tipe === 'Pemasukan') {
        weeklyData[key].income += tx.jumlah;
      } else {
        weeklyData[key].expense += tx.jumlah;
      }
      weeklyData[key].txCount += 1;
    });
    
    return Object.values(weeklyData).sort((a, b) => b.rawWeek.startStr.localeCompare(a.rawWeek.startStr));
  };

  // 3. Monthly summary calculator
  const getMonthlyReports = () => {
    const monthlyData: { [key: string]: { label: string; income: number; expense: number; txCount: number; rawMonth: any } } = {};
    
    transactions.forEach(tx => {
      const details = getMonthDetails(tx.tanggal);
      if (!details) return;
      const key = details.key;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          label: details.label,
          income: 0,
          expense: 0,
          txCount: 0,
          rawMonth: details
        };
      }
      if (tx.tipe === 'Pemasukan') {
        monthlyData[key].income += tx.jumlah;
      } else {
        monthlyData[key].expense += tx.jumlah;
      }
      monthlyData[key].txCount += 1;
    });
    
    return Object.values(monthlyData).sort((a, b) => b.rawMonth.key.localeCompare(a.rawMonth.key));
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column (4/12 width) - Visual analytics, explanations, and quick guides */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic Category Proportions */}
        <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-5">Proporsi Kas (Sesuai Filter)</h4>
          
          {categoriesList.length === 0 ? (
            <div className="text-center py-8 text-xs text-white/30 font-sans">
              Belum ada data untuk kategori ini.
            </div>
          ) : (
            <div className="space-y-4">
              {categoriesList.slice(0, 5).map((cat) => {
                const percent = Math.min(100, Math.round((cat.value / maxCatValue) * 100));
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white/60 font-semibold font-sans">{cat.name}</span>
                      <span className="text-[#bef264] font-mono font-bold">{formatRupiah(cat.value)}</span>
                    </div>
                    {/* Visual tracker bar */}
                    <div className="w-full bg-[#0a0a0b] rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className="bg-[#bef264] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[9px] text-white/30 font-mono text-center pt-4 tracking-widest uppercase border-t border-white/5">
                Data dinamis merujuk pada filter aktif
              </p>
            </div>
          )}
        </div>

        {/* Sync Ke Kas - Educational Help Box */}
        {showSyncExplainer && (
          <div className="bg-[#111112] border border-[#bef264]/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-[#bef264]/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#bef264]/10 rounded-lg flex items-center justify-center text-[#bef264]">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-white">Apa itu "Sync ke Kas"?</h4>
              </div>
              <button 
                onClick={() => setShowSyncExplainer(false)}
                className="text-white/30 hover:text-white/60 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Setiap sesi latihan (Matchday) memiliki catatan internal: **Pemasukan** dari iuran pemain lunas, dan **Pengeluaran** (sewa lapangan, air, dll).
            </p>
            <p className="text-xs text-white/50 leading-relaxed font-sans mt-2">
              Uang ini hanyalah draf dan **tidak otomatis masuk ke Buku Kas Utama** tim agar tidak rancu.
            </p>
            <p className="text-xs text-white/50 leading-relaxed font-sans mt-2">
              Saat Anda menekan tombol <strong className="text-[#bef264] font-semibold">"Sync ke Kas"</strong> di Matchday, sistem akan otomatis mencatatkan iuran terkumpul dan pengeluaran sesi tersebut ke Buku Kas Utama ini sekali klik.
            </p>
          </div>
        )}

        {/* Global Finance Summary */}
        <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-32 h-32 bg-[#bef264]/5 rounded-full blur-2xl pointer-events-none" />
          <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-white/40 mb-3">Subtotal Filter Aktif</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-white/50">Total Pemasukan:</span>
              <span className="text-[#bef264] font-mono font-medium">{formatRupiah(totalSubIncome)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="text-white/50">Total Pengeluaran:</span>
              <span className="text-rose-400 font-mono font-medium">{formatRupiah(totalSubExpense)}</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold">
              <span className="text-white/80">Surplus / Defisit:</span>
              <span className={`font-mono font-black ${totalSubIncome - totalSubExpense >= 0 ? 'text-[#bef264]' : 'text-rose-455 text-rose-400'}`}>
                {totalSubIncome - totalSubExpense >= 0 ? '+' : ''}
                {formatRupiah(totalSubIncome - totalSubExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Right Column (8/12 width) - Main reports and data tables */}
      <div className="lg:col-span-8 bg-[#111112] border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Tab Selection Header */}
        <div className="p-6 sm:p-8 pb-3 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
                <h3 className="text-lg font-bold font-sans text-white tracking-tight">Laporan Keuangan & Kas</h3>
                <p className="text-xs text-white/50 mt-1 font-sans">Kelola pencatatan transaksi kas serta laporan surplus/defisit periodik.</p>
              </div>
            </div>

            <button
              onClick={onAddTransaction}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#bef264] hover:bg-brand-hover text-black font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-[#bef264]/10 shrink-0 transition-colors"
            >
              <Plus className="h-4 w-4 stroke-[3px]" />
              Catat Transaksi
            </button>
          </div>

        </div>

        {/* INTEGRATED DASHBOARD PRESETS - MINGGUAN & BULANAN IN 1 PAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 sm:px-8 py-5 border-b border-white/5 bg-[#18181b]/15">
          
          {/* COLUMN 1: MINGGUAN SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#bef264]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">📅 Rekap Hasil Mingguan</h4>
              </div>
              <span className="text-[9px] font-mono text-white/30 uppercase">Klik untuk filter</span>
            </div>
            
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
              {getWeeklyReports().length === 0 ? (
                <div className="p-6 text-center border border-white/5 rounded-2xl bg-black/30">
                  <AlertCircle className="h-5 w-5 text-white/20 mb-1 mx-auto" />
                  <p className="text-[10px] text-white/50 font-bold">Belum Ada Transaksi Mingguan</p>
                </div>
              ) : (
                getWeeklyReports().map((week) => {
                  const net = week.income - week.expense;
                  const isFiltered = periodFilter === 'SpecificWeek' && chosenWeek === week.label;
                  return (
                    <div 
                      key={week.label} 
                      onClick={() => {
                        setPeriodFilter('SpecificWeek');
                        setChosenWeek(week.label);
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between gap-4 border cursor-pointer transition-all duration-200 ${
                        isFiltered 
                          ? 'bg-[#bef264]/10 border-[#bef264]/40 shadow-sm shadow-[#bef264]/5 font-bold' 
                          : 'bg-black/35 border-white/5 hover:border-white/11 hover:bg-[#1c1c1f]/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold tracking-tight ${isFiltered ? 'text-[#bef264]' : 'text-white/80'}`}>
                            {week.rawWeek.shortLabel || week.label}
                          </span>
                          {isFiltered && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-white/35 block leading-none">
                          {week.label.includes('(') ? week.label.substring(week.label.indexOf('(')) : week.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold block ${net >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                            {net >= 0 ? '+' : ''}{formatRupiah(net)}
                          </span>
                          <span className="text-[8px] font-mono text-white/30 block mt-0.5">
                            {week.txCount} tx • I: {formatRupiah(week.income)} | E: {formatRupiah(week.expense)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: BULANAN SUMMARY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#bef264]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">📊 Rekap Hasil Bulanan</h4>
              </div>
              <span className="text-[9px] font-mono text-white/30 uppercase">Klik untuk filter</span>
            </div>

            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
              {getMonthlyReports().length === 0 ? (
                <div className="p-6 text-center border border-white/5 rounded-2xl bg-black/30">
                  <AlertCircle className="h-5 w-5 text-white/20 mb-1 mx-auto" />
                  <p className="text-[10px] text-white/50 font-bold">Belum Ada Transaksi Bulanan</p>
                </div>
              ) : (
                getMonthlyReports().map((month) => {
                  const net = month.income - month.expense;
                  const isFiltered = periodFilter === 'SpecificMonth' && chosenMonth === month.rawMonth.key;
                  return (
                    <div 
                      key={month.rawMonth.key} 
                      onClick={() => {
                        setPeriodFilter('SpecificMonth');
                        setChosenMonth(month.rawMonth.key);
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between gap-4 border cursor-pointer transition-all duration-200 ${
                        isFiltered 
                          ? 'bg-[#bef264]/10 border-[#bef264]/40 shadow-sm shadow-[#bef264]/5 font-bold' 
                          : 'bg-black/35 border-white/5 hover:border-white/11 hover:bg-[#1c1c1f]/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold tracking-tight ${isFiltered ? 'text-[#bef264]' : 'text-white/80'}`}>
                            {month.label}
                          </span>
                          {isFiltered && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-white/35 block leading-none">
                          Standard Monthly Report
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold block ${net >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                            {net >= 0 ? '+' : ''}{formatRupiah(net)}
                          </span>
                          <span className="text-[8px] font-mono text-white/30 block mt-0.5">
                            {month.txCount} tx • I: {formatRupiah(month.income)} | E: {formatRupiah(month.expense)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* LEDGER TRANSACTIONS SECTION - ALWAY ON PAGE */}
        <div className="flex-grow flex flex-col">
          {/* Section banner */}
          <div className="px-6 sm:px-8 pt-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-white font-mono">📂 Buku Kas Utama (Buku Besar)</h4>
            </div>
            
            {periodFilter !== 'All' && (
              <button 
                onClick={() => {
                  setPeriodFilter('All');
                  setChosenWeek('All');
                  setChosenMonth('All');
                }}
                className="text-[10px] font-mono bg-[#bef264]/10 hover:bg-[#bef264]/20 border border-[#bef264]/20 text-[#bef264] px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Reset Filter Waktu
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="p-6 sm:px-8 py-4 bg-white/[0.01] border-b border-white/5 space-y-3">
            {/* Filter Row 1: Search + Income/Expense Selection */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Cari deskripsi, kategori, member..."
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

              <div className="md:col-span-3">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterCategory('All');
                  }}
                  className="w-full px-3 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white/50 focus:outline-none focus:border-[#bef264] transition-colors cursor-pointer"
                >
                  <option value="All">Semua Tipe</option>
                  <option value="Pemasukan">Hanya Pemasukan</option>
                  <option value="Pengeluaran">Hanya Pengeluaran</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white/50 focus:outline-none focus:border-[#bef264] transition-colors cursor-pointer"
                >
                  <option value="All">Semua Kategori</option>
                  {filterType === 'Pemasukan' &&
                    FINANCIAL_CATEGORIES.Pemasukan.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  {filterType === 'Pengeluaran' &&
                    FINANCIAL_CATEGORIES.Pengeluaran.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  {filterType === 'All' &&
                    Array.from(new Set([...FINANCIAL_CATEGORIES.Pemasukan, ...FINANCIAL_CATEGORIES.Pengeluaran])).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Filter Row 2: Clean Period Selector - Dropdown based */}
            <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#bef264] font-semibold flex items-center gap-1.5 shrink-0 select-none">
                <Filter className="h-3.5 w-3.5" />
                Filter Periode:
              </span>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                {/* Select Period Preset / Mode */}
                <select
                  value={periodFilter}
                  onChange={(e) => {
                    const val = e.target.value as 'All' | 'ThisWeek' | 'ThisMonth' | 'SpecificWeek' | 'SpecificMonth';
                    setPeriodFilter(val);
                    if (val === 'SpecificWeek' && availableWeeks.length > 0) {
                      setChosenWeek('All');
                    } else if (val === 'SpecificMonth' && availableMonths.length > 0) {
                      setChosenMonth('All');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-[#bef264] transition-colors cursor-pointer font-sans min-w-[150px]"
                >
                  <option value="All">Semua Waktu</option>
                  <option value="ThisWeek">Minggu Ini</option>
                  <option value="ThisMonth">Bulan Ini</option>
                  <option value="SpecificWeek">Pilih Minggu Spesifik</option>
                  <option value="SpecificMonth">Pilih Bulan Spesifik</option>
                </select>

                {/* Sub-selector for SpecificWeek */}
                {periodFilter === 'SpecificWeek' && availableWeeks.length > 0 && (
                  <select
                    value={chosenWeek}
                    onChange={(e) => setChosenWeek(e.target.value)}
                    className="px-3 py-1.5 bg-[#0a0a0b] text-[#bef264] border border-[#bef264]/30 rounded-lg text-xs font-mono focus:outline-none animate-fade-in cursor-pointer min-w-[170px]"
                  >
                    <option value="All" className="bg-black text-white/40">-- Semua Minggu --</option>
                    {availableWeeks.map((w) => (
                      <option key={w.label} value={w.label} className="bg-[#0a0a0b] text-neutral-200">
                        {w.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sub-selector for SpecificMonth */}
                {periodFilter === 'SpecificMonth' && availableMonths.length > 0 && (
                  <select
                    value={chosenMonth}
                    onChange={(e) => setChosenMonth(e.target.value)}
                    className="px-3 py-1.5 bg-[#0a0a0b] text-[#bef264] border border-[#bef264]/30 rounded-lg text-xs font-mono focus:outline-none animate-fade-in cursor-pointer min-w-[170px]"
                  >
                    <option value="All" className="bg-black text-white/40">-- Semua Bulan --</option>
                    {availableMonths.map((m) => (
                      <option key={m.key} value={m.key} className="bg-[#0a0a0b] text-neutral-200 font-sans">
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Ledger Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center flex-grow flex flex-col justify-center items-center">
              <AlertCircle className="h-8 w-8 text-white/20 mb-3" />
              <p className="text-sm text-white/60 font-sans font-semibold">Tidak Ada Transaksi</p>
              <p className="text-xs text-white/30 mt-1">Ubah filter, reset filter pencarian waktu, atau tambahkan iuran/transaksi baru.</p>
            </div>
          ) : (
            <div className="flex-grow">
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#18181b] text-white/40 font-mono text-[9px] uppercase tracking-widest">
                      <th className="px-6 py-4 font-semibold">Tanggal</th>
                      <th className="px-6 py-4 font-semibold">Deskripsi</th>
                      <th className="px-6 py-4 font-semibold">Kategori</th>
                      <th className="px-6 py-4 font-semibold text-center">Tipe</th>
                      <th className="px-6 py-4 font-semibold font-mono text-right">Jumlah</th>
                      <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-white/55">
                          {tx.tanggal}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-xs font-bold text-white/90 font-sans">
                              {tx.deskripsi}
                            </div>
                            {tx.kodeMember && (
                              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-black border border-white/5 text-[9px] text-[#bef264] font-mono leading-none">
                                Oleh {getMemberName(tx.kodeMember)} ({tx.kodeMember})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-white/60">
                          {tx.kategori}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                            tx.tipe === 'Pemasukan'
                              ? 'bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/10'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-900/10'
                          }`}>
                            {tx.tipe === 'Pemasukan' ? (
                              <>
                                <ArrowUpRight className="h-3 w-3" />
                                Masuk
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="h-3 w-3" />
                                Keluar
                              </>
                            )}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right text-xs font-mono font-bold ${
                          tx.tipe === 'Pemasukan' ? 'text-[#bef264]' : 'text-rose-400'
                        }`}>
                          {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setPendingDeleteTx(tx)}
                            className="p-2 bg-white/5 hover:bg-rose-500/15 border border-white/5 hover:border-white/10 text-white/40 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="block md:hidden divide-y divide-white/5 bg-[#111112]">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-white/30 font-mono block mb-1">
                          {tx.tanggal} • {tx.kategori}
                        </span>
                        <h5 className="text-xs font-semibold text-white/90 leading-snug font-sans">
                          {tx.deskripsi}
                        </h5>
                        {tx.kodeMember && (
                          <div className="inline-flex items-center gap-1.5 mt-2 px-1.5 py-0.5 rounded bg-black border border-white/5 text-[9px] text-[#bef264] font-mono leading-none">
                            {tx.kodeMember} ({getMemberName(tx.kodeMember)})
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-xs font-bold font-mono ${
                          tx.tipe === 'Pemasukan' ? 'text-[#bef264]' : 'text-rose-400'
                        }`}>
                          {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                        </p>
                        <span className={`inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          tx.tipe === 'Pemasukan'
                            ? 'bg-[#bef264]/10 text-[#bef264]'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.tipe === 'Pemasukan' ? 'Masuk' : 'Keluar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setPendingDeleteTx(tx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-mono text-rose-300 hover:text-white bg-rose-500/15 active:bg-rose-500/25 border border-rose-500/10 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTION DELETE DIALOG/OVERLAY (CONFIRMATION MODAL) */}
      {pendingDeleteTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setPendingDeleteTx(null)} />
          <div className="relative w-full max-w-sm bg-[#111112] border border-white/5 rounded-3xl p-6 z-10 animate-fade-in font-sans">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Hapus Catatan Kas?</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 my-3 space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/30">{pendingDeleteTx.tanggal} • {pendingDeleteTx.kategori}</span>
              <p className="text-xs font-bold text-white leading-normal truncate">{pendingDeleteTx.deskripsi}</p>
              <p className={`text-sm font-bold font-mono ${pendingDeleteTx.tipe === 'Pemasukan' ? 'text-[#bef264]' : 'text-[#f43f5e]'}`}>
                {pendingDeleteTx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(pendingDeleteTx.jumlah)}
              </p>
            </div>
            <p className="text-xs text-white/50 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus catatan transaksi di atas? Saldo kas tim akan disesuaikan secara otomatis.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setPendingDeleteTx(null)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(pendingDeleteTx.id);
                  setPendingDeleteTx(null);
                }}
                className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-rose-500/10"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
