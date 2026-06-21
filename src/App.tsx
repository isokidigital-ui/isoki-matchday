import { useState, useEffect } from 'react';
import { Member, Transaction, AuthState, Matchday, ClubConfig } from './types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from './data';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import StatsGrid from './components/StatsGrid';
import MemberList from './components/MemberList';
import FinancialLedger from './components/FinancialLedger';
import MatchdayDashboard from './components/MatchdayDashboard';
import HomeMatches from './components/HomeMatches';
import ModalMember from './components/ModalMember';
import ModalTransaction from './components/ModalTransaction';
import { Shield, Users, Wallet, CheckCircle2, X, AlertTriangle, Cloud, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS, LangType } from './utils/lang';
import { useAuth } from './hooks/useAuth';
import { useMembers } from './hooks/useMembers';
import { useTransactions } from './hooks/useTransactions';
import { useMatchdays } from './hooks/useMatchdays';


export default function App() {
  // ---- SUPABASE & SYNC STATE ----
  const [clubId, setClubId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState(true); // Fallback untuk offline

  // Supabase Hooks
  const authHook = useAuth();
  const membersHook = useMembers();
  const transactionsHook = useTransactions();
  const matchdaysHook = useMatchdays();

  // ---- LANGUAGE SELECTION STATE ----
  const [lang, setLang] = useState<LangType>(() => {
    return (localStorage.getItem('isoki_lang') as LangType) || 'ID';
  });

  const toggleLang = () => {
    const nextLang = lang === 'ID' ? 'EN' : 'ID';
    setLang(nextLang);
    localStorage.setItem('isoki_lang', nextLang);
  };

  const t = TRANSLATIONS[lang];

  // ---- STORES & PERSISTENCY STATE ----
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [selectedMatchdayId, setSelectedMatchdayId] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, adminUsername: null });
  const [currentTab, setTab] = useState<'dashboard' | 'members' | 'finance' | 'matchday'>('dashboard');
  
  // Custom Club Profile state
  const [clubConfig, setClubConfig] = useState<ClubConfig | null>(null);

  // Dynamic Theme Custom Colors Effect
  useEffect(() => {
    if (clubConfig?.themeColor && clubConfig?.themeColorHover) {
      document.documentElement.style.setProperty('--brand-color', clubConfig.themeColor);
      document.documentElement.style.setProperty('--brand-color-hover', clubConfig.themeColorHover);
    } else {
      document.documentElement.style.setProperty('--brand-color', '#bef264');
      document.documentElement.style.setProperty('--brand-color-hover', '#a3d94b');
    }
  }, [clubConfig]);

  // ---- MODAL / OVERLAY STATE ----
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);

  // Custom Deactivation Confirmation Modal state
  const [deactivatingMemberCode, setDeactivatingMemberCode] = useState<string | null>(null);

  // Helper helper to get current active prefix
  const getClubAbbrev = (): string => {
    return clubConfig?.abbreviation.toUpperCase() || 'GBMFC';
  };

  // ---- INITIAL STORAGE LOAD ----
  useEffect(() => {
    // 0. Club Profile Config
    const storedClub = localStorage.getItem('isoki_club_config');
    let activeClub: ClubConfig | null = null;
    if (storedClub) {
      try {
        activeClub = JSON.parse(storedClub);
        setClubConfig(activeClub);
      } catch (e) {}
    }

    const abbrev = activeClub?.abbreviation.toUpperCase() || 'GBMFC';
    const isDemo = !activeClub || (activeClub.abbreviation === 'GBMFC' && !activeClub.themeColor);

    // 1. Members
    const storedMembers = localStorage.getItem('isoki_members');
    let currentMembersList = INITIAL_MEMBERS;
    if (storedMembers) {
      try {
        currentMembersList = JSON.parse(storedMembers);
        setMembers(currentMembersList);
      } catch (e) {
        setMembers(INITIAL_MEMBERS);
      }
    } else {
      if (!isDemo) {
        currentMembersList = [];
      } else {
        currentMembersList = INITIAL_MEMBERS.map(m => ({
          ...m,
          kodeMember: m.kodeMember.replace('GBMFC', abbrev)
        }));
      }
      setMembers(currentMembersList);
      localStorage.setItem('isoki_members', JSON.stringify(currentMembersList));
    }

    // 2. Transactions
    const storedTx = localStorage.getItem('isoki_transactions');
    if (storedTx) {
      try {
        setTransactions(JSON.parse(storedTx));
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } else {
      let seedTx = INITIAL_TRANSACTIONS;
      if (!isDemo) {
        seedTx = [];
      } else {
        seedTx = INITIAL_TRANSACTIONS.map(t => ({
          ...t,
          kodeMember: t.kodeMember ? t.kodeMember.replace('GBMFC', abbrev) : undefined
        }));
      }
      setTransactions(seedTx);
      localStorage.setItem('isoki_transactions', JSON.stringify(seedTx));
    }

    // 3. Matchdays Setup with Standard Default Seed
    const storedMd = localStorage.getItem('isoki_matchdays');
    if (storedMd) {
      try {
        setMatchdays(JSON.parse(storedMd));
      } catch (e) {
        // failed
      }
    } else {
      if (!isDemo) {
        const seedMatchdays: Matchday[] = [];
        setMatchdays(seedMatchdays);
        localStorage.setItem('isoki_matchdays', JSON.stringify(seedMatchdays));
      } else {
        const activeSeedMembers = currentMembersList.filter(m => m.aktif);
        const seedMatchdays: Matchday[] = [
          {
            id: 'seed_match_1',
            tanggal: '2026-06-07',
            waktuMulai: '14:00',
            waktuSelesai: '16:00',
            namaMatchday: 'Matchday #10 (Latihan Mingguan)',
            lokasi: 'Siliwangi Futsal Arena',
            sewaLapangan: 200000,
            airMinum: 40000,
            parkir: 25000,
            laundry: 20000,
            isSynced: true, // Synced to demonstrate history
            jenisMatch: 'Latihan Internal',
            kategoriCabang: 'Futsal',
            attendance: activeSeedMembers.map((m) => ({
              memberId: m.id,
              kodeMember: m.kodeMember,
              nama: m.nama,
              posisi: m.posisi,
              hadir: m.kodeMember !== `${abbrev}004`, // Agus absent
              bayar: m.kodeMember !== `${abbrev}004`,
              jumlahBayar: m.posisi === 'Keeper' ? 10000 : 15000
            }))
          },
          {
            id: 'seed_match_2',
            tanggal: '2026-06-14',
            waktuMulai: '14:00',
            waktuSelesai: '16:00',
            namaMatchday: 'Matchday #11 (Latihan Mingguan)',
            lokasi: 'Siliwangi Futsal Arena',
            sewaLapangan: 200000,
            airMinum: 40000,
            parkir: 25000,
            laundry: 20000,
            isSynced: false,
            jenisMatch: 'Sparing',
            kategoriCabang: 'Mini Soccer',
            attendance: activeSeedMembers.map((m) => ({
              memberId: m.id,
              kodeMember: m.kodeMember,
              nama: m.nama,
              posisi: m.posisi,
              hadir: true, // Everyone present
              bayar: m.kodeMember !== `${abbrev}005`, // Yayan hasn't paid yet
              jumlahBayar: m.posisi === 'Keeper' ? 10000 : 15000
            }))
          }
        ];
        setMatchdays(seedMatchdays);
        localStorage.setItem('isoki_matchdays', JSON.stringify(seedMatchdays));
      }
    }

    // 4. Auth
    const storedAuth = localStorage.getItem('isoki_auth_session');
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (e) {
        // failed or clean
      }
    }
  }, [clubConfig?.abbreviation]);

  // ---- PERSIST WRITERS ----
  const persistMembers = (updated: Member[]) => {
    setMembers(updated);
    localStorage.setItem('isoki_members', JSON.stringify(updated));
  };

  const persistTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('isoki_transactions', JSON.stringify(updated));
  };

  // ---- AUTH ACTIONS ----
  const handleLogin = async (username: string, customConfig?: ClubConfig) => {
    // Support both Supabase login dan local login (backward compat)
    if (!customConfig) {
      // Try Supabase login with username
      setIsSyncing(true);
      setSyncError(null);
      try {
        // Fallback: untuk saat ini kita gunakan localStorage
        // Nanti bisa dimodify untuk proper Supabase auth
        const storedClub = localStorage.getItem('isoki_club_config');
        if (storedClub) {
          customConfig = JSON.parse(storedClub);
        }
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    const newAuth: AuthState = { isAuthenticated: true, adminUsername: username };
    setAuth(newAuth);
    localStorage.setItem('isoki_auth_session', JSON.stringify(newAuth));

    if (customConfig) {
      setClubConfig(customConfig);
      localStorage.setItem('isoki_club_config', JSON.stringify(customConfig));

      const abbrev = customConfig.abbreviation.toUpperCase();
      const isDemo = customConfig.abbreviation === 'GBMFC' && !customConfig.themeColor;

      // Load data dari localStorage atau Supabase
      await loadClubData(abbrev, isDemo);
    }
  };

  // Helper function untuk load club data
  const loadClubData = async (abbrev: string, isDemo: boolean) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      // 1. Members
      const storedMembers = localStorage.getItem('isoki_members');
      let currentMembersList = INITIAL_MEMBERS;
      if (storedMembers) {
        try {
          currentMembersList = JSON.parse(storedMembers);
          setMembers(currentMembersList);
        } catch (e) {
          setMembers(INITIAL_MEMBERS);
        }
      } else {
        if (!isDemo) {
          currentMembersList = [];
        } else {
          currentMembersList = INITIAL_MEMBERS.map(m => ({
            ...m,
            kodeMember: m.kodeMember.replace('GBMFC', abbrev)
          }));
        }
        setMembers(currentMembersList);
        localStorage.setItem('isoki_members', JSON.stringify(currentMembersList));
      }

      // 2. Transactions
      const storedTx = localStorage.getItem('isoki_transactions');
      if (storedTx) {
        try {
          setTransactions(JSON.parse(storedTx));
        } catch (e) {
          setTransactions(INITIAL_TRANSACTIONS);
        }
      } else {
        let seedTx = INITIAL_TRANSACTIONS;
        if (!isDemo) {
          seedTx = [];
        } else {
          seedTx = INITIAL_TRANSACTIONS.map(t => ({
            ...t,
            kodeMember: t.kodeMember ? t.kodeMember.replace('GBMFC', abbrev) : undefined
          }));
        }
        setTransactions(seedTx);
        localStorage.setItem('isoki_transactions', JSON.stringify(seedTx));
      }

      // 3. Matchdays
      const storedMd = localStorage.getItem('isoki_matchdays');
      if (storedMd) {
        try {
          setMatchdays(JSON.parse(storedMd));
        } catch (e) {
          // failed
        }
      } else {
        if (!isDemo) {
          setMatchdays([]);
          localStorage.setItem('isoki_matchdays', JSON.stringify([]));
        } else {
          const activeSeedMembers = currentMembersList.filter(m => m.aktif);
          const seedMatchdays: Matchday[] = [
            {
              id: 'seed_match_1',
              tanggal: '2026-06-07',
              waktuMulai: '14:00',
              waktuSelesai: '16:00',
              namaMatchday: 'Matchday #10 (Latihan Mingguan)',
              lokasi: 'Siliwangi Futsal Arena',
              sewaLapangan: 200000,
              airMinum: 40000,
              parkir: 25000,
              laundry: 20000,
              isSynced: true,
              jenisMatch: 'Latihan Internal',
              kategoriCabang: 'Futsal',
              attendance: activeSeedMembers.map((m) => ({
                memberId: m.id,
                kodeMember: m.kodeMember,
                nama: m.nama,
                posisi: m.posisi,
                hadir: m.kodeMember !== `${abbrev}004`,
                bayar: m.kodeMember !== `${abbrev}004`,
                jumlahBayar: m.posisi === 'Keeper' ? 10000 : 15000
              }))
            },
            {
              id: 'seed_match_2',
              tanggal: '2026-06-14',
              waktuMulai: '14:00',
              waktuSelesai: '16:00',
              namaMatchday: 'Matchday #11 (Latihan Mingguan)',
              lokasi: 'Siliwangi Futsal Arena',
              sewaLapangan: 200000,
              airMinum: 40000,
              parkir: 25000,
              laundry: 20000,
              isSynced: false,
              jenisMatch: 'Sparing',
              kategoriCabang: 'Mini Soccer',
              attendance: activeSeedMembers.map((m) => ({
                memberId: m.id,
                kodeMember: m.kodeMember,
                nama: m.nama,
                posisi: m.posisi,
                hadir: true,
                bayar: m.kodeMember !== `${abbrev}005`,
                jumlahBayar: m.posisi === 'Keeper' ? 10000 : 15000
              }))
            }
          ];
          setMatchdays(seedMatchdays);
          localStorage.setItem('isoki_matchdays', JSON.stringify(seedMatchdays));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Load data failed';
      setSyncError(message);
      console.error('Load data error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    const expiredAuth: AuthState = { isAuthenticated: false, adminUsername: null };
    setAuth(expiredAuth);
    localStorage.removeItem('isoki_auth_session');
  };

  // ---- AUTO GENERATE KODE MEMBER ----
  // Format: [PREFIX]001, [PREFIX]002... Auto Increment, Readonly
  const getNextMemberCode = (): string => {
    let maxNum = 0;
    const prefix = getClubAbbrev();
    const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');
    members.forEach((m) => {
      const matcher = m.kodeMember.match(regex);
      if (matcher && matcher[1]) {
        const num = parseInt(matcher[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  };

  // ---- MEMBER ACTIONS ----
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  const handleSaveMember = async (memberData: Omit<Member, 'id'> & { id?: string }) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      if (memberData.id) {
        // Edit action
        const updated = members.map((m) =>
          m.id === memberData.id ? { ...m, ...memberData as Member } : m
        );
        persistMembers(updated);

        // Sync to Supabase if clubId exists
        if (clubId) {
          const result = await membersHook.updateMember(memberData.id, memberData);
          if (!result.success) {
            setSyncError('Failed to sync member to Supabase');
          }
        }
      } else {
        // Add action
        const newMember: Member = {
          id: 'mem_' + Date.now(),
          kodeMember: getNextMemberCode(),
          nama: memberData.nama,
          noHp: memberData.noHp,
          posisi: memberData.posisi,
          aktif: true,
          fotoProfil: memberData.fotoProfil,
        };
        persistMembers([...members, newMember]);

        // Sync to Supabase if clubId exists
        if (clubId) {
          const result = await membersHook.addMember(clubId, newMember);
          if (!result.success) {
            setSyncError('Failed to sync member to Supabase');
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setSyncError(message);
      console.error('Save member error:', err);
    } finally {
      setIsSyncing(false);
      setMemberModalOpen(false);
      setEditingMember(null);
    }
  };

  // Confirm and Execute Deactivation
  const handleTryDeactivateMember = (kodeMember: string) => {
    setDeactivatingMemberCode(kodeMember);
  };

  const handleConfirmDeactivate = () => {
    if (deactivatingMemberCode) {
      const updated = members.map((m) =>
        m.kodeMember === deactivatingMemberCode ? { ...m, aktif: false } : m
      );
      persistMembers(updated);
      setDeactivatingMemberCode(null);
    }
  };

  const handleToggleStatus = async (kodeMember: string) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const updated = members.map((m) =>
        m.kodeMember === kodeMember ? { ...m, aktif: !m.aktif } : m
      );
      persistMembers(updated);

      // Sync to Supabase if clubId exists
      const member = updated.find(m => m.kodeMember === kodeMember);
      if (clubId && member) {
        const result = await membersHook.toggleMemberActive(member.id, member.aktif);
        if (!result.success) {
          setSyncError('Failed to sync status to Supabase');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ---- TRANSACTION ACTIONS ----
  const handleOpenAddTransaction = () => {
    setTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'>) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        ...txData,
      };
      persistTransactions([newTx, ...transactions]);

      // Sync to Supabase if clubId exists
      if (clubId) {
        const result = await transactionsHook.addTransaction(clubId, txData);
        if (!result.success) {
          setSyncError('Failed to sync transaction to Supabase');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setSyncError(message);
      console.error('Save transaction error:', err);
    } finally {
      setIsSyncing(false);
      setTransactionModalOpen(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const updated = transactions.filter((t) => t.id !== id);
      persistTransactions(updated);

      // Sync to Supabase if clubId exists
      if (clubId) {
        const result = await transactionsHook.deleteTransaction(id);
        if (!result.success) {
          setSyncError('Failed to delete transaction from Supabase');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  // ---- METRICS CALCULATIONS ----
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.aktif).length;
  const inactiveMembers = totalMembers - activeMembers;

  const totalIncome = transactions
    .filter((t) => t.tipe === 'Pemasukan')
    .reduce((a, b) => a + b.jumlah, 0);

  const totalExpense = transactions
    .filter((t) => t.tipe === 'Pengeluaran')
    .reduce((a, b) => a + b.jumlah, 0);

  const netBalance = totalIncome - totalExpense;

  // Protect Router Screen
  if (!auth.isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} lang={lang} toggleLang={toggleLang} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-neutral-200 flex flex-col font-sans select-none antialiased">
      {/* Header bar and controls */}
      <Header
        currentTab={currentTab}
        setTab={(tab) => {
          setTab(tab);
          setSelectedMatchdayId(null);
        }}
        adminName={auth.adminUsername || 'Admin Isoki'}
        onLogout={handleLogout}
        clubConfig={clubConfig}
        lang={lang}
        toggleLang={toggleLang}
      />

      {/* Main container with fluid, responsive grid spacing - pb-24 on mobile prevents floating menu overlap */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8">
        <AnimatePresence mode="wait">
          {currentTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Primary Bento Stats panel */}
              <StatsGrid
                totalMembers={totalMembers}
                activeMembers={activeMembers}
                inactiveMembers={inactiveMembers}
                balance={netBalance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                onQuickAddMember={handleOpenAddMember}
                onQuickAddTransaction={handleOpenAddTransaction}
              />

              {/* Slider Info Matchday Sesi */}
              <HomeMatches
                matchdays={matchdays}
                onSelectMatchday={(id) => {
                  setSelectedMatchdayId(id);
                  setTab('matchday');
                }}
              />

              {/* Secondary Layout for quick overview list lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compact latest transactions ledger */}
                <div className="bg-[#111112] border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Transaksi Terakhir</h4>
                      <button onClick={() => setTab('finance')} className="text-xs text-[#bef264] hover:text-[#bef264]/80 font-semibold cursor-pointer tracking-wider">
                        Lihat Semua →
                      </button>
                    </div>

                    {transactions.length === 0 ? (
                      <p className="text-xs text-white/30 py-6 text-center font-sans">Belum ada pencatatan kas iuran.</p>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 4).map((tx) => (
                          <div key={tx.id} className="flex justify-between items-center p-3.5 bg-[#18181b] border border-white/5 rounded-2xl">
                            <div>
                              <p className="text-xs font-semibold text-neutral-205 text-neutral-300">{tx.deskripsi}</p>
                              <span className="text-[9px] font-mono text-white/40 block mt-0.5 uppercase tracking-wide">{tx.tanggal} • {tx.kategori}</span>
                            </div>
                            <span className={`text-xs font-extrabold font-mono ${tx.tipe === 'Pemasukan' ? 'text-[#bef264]' : 'text-rose-400'}`}>
                              {tx.tipe === 'Pemasukan' ? '+' : '-'} Rp{tx.jumlah.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 text-[10px] text-white/30 font-sans text-center">
                    Kas realtime diperbarui otomatis pada setiap pencatatan iuran baru.
                  </div>
                </div>

                {/* Compact Member statistics Overview */}
                <div className="bg-[#111112] border border-white/5 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Roster Terbaru</h4>
                      <button onClick={() => setTab('members')} className="text-xs text-[#bef264] hover:text-[#bef264]/80 font-semibold cursor-pointer tracking-wider">
                        Lihat Semua →
                      </button>
                    </div>

                    {members.length === 0 ? (
                      <p className="text-xs text-white/30 py-6 text-center font-sans">Belum ada roster terdaftar.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {members.slice().reverse().slice(0, 4).map((m) => (
                          <div key={m.id} className="flex items-center gap-3 p-3 bg-[#18181b] border border-white/5 rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0 select-none">
                              {m.nama.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-neutral-200 truncate leading-none mb-1">{m.nama}</p>
                              <span className="text-[9px] font-mono text-[#bef264] block font-semibold leading-none">{m.kodeMember}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 text-[10px] text-white/30 font-sans text-center">
                    Daftarkan nomor WhatsApp member untuk mempermudah koordinasi pertandingan futsal/bola.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentTab === 'members' && (
            <motion.div
              key="members-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <MemberList
                members={members}
                onAddMember={handleOpenAddMember}
                onEditMember={handleOpenEditMember}
                onDeactivateMember={handleTryDeactivateMember}
                onToggleStatus={handleToggleStatus}
                onBackToDashboard={() => setTab('dashboard')}
              />
            </motion.div>
          )}

          {currentTab === 'finance' && (
            <motion.div
              key="finance-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <FinancialLedger
                transactions={transactions}
                members={members}
                matchdays={matchdays}
                onAddTransaction={handleOpenAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onBackToDashboard={() => setTab('dashboard')}
                onSelectMatchday={(id) => {
                  setSelectedMatchdayId(id);
                  setTab('matchday');
                }}
              />
            </motion.div>
          )}

          {currentTab === 'matchday' && (
            <motion.div
              key="matchday-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <MatchdayDashboard
                members={members}
                transactions={transactions}
                onAddTransaction={handleSaveTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                matchdays={matchdays}
                setMatchdays={setMatchdays}
                onBackToDashboard={() => setTab('dashboard')}
                selectedMatchdayId={selectedMatchdayId}
                setSelectedMatchdayId={setSelectedMatchdayId}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ---- GLOBAL MODAL RENDERERS ---- */}
      <AnimatePresence>
        {/* Member Add/Edit Modal */}
        {isMemberModalOpen && (
          <ModalMember
            onClose={() => {
              setMemberModalOpen(false);
              setEditingMember(null);
            }}
            onSave={handleSaveMember}
            editMember={editingMember}
            nextMemberCode={getNextMemberCode()}
          />
        )}

        {/* Transaction Creation Modal */}
        {isTransactionModalOpen && (
          <ModalTransaction
            onClose={() => setTransactionModalOpen(false)}
            onSave={handleSaveTransaction}
            members={members}
          />
        )}
        {deactivatingMemberCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop wrapper */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDeactivatingMemberCode(null)} />
            
            {/* Dialog block card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#111112] border border-white/5 rounded-3xl shadow-2xl p-6 z-10 animate-fade-in"
            >
              <div className="w-12 h-12 bg-rose-955/20 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold font-sans text-white">Nonaktifkan Member?</h4>
              <p className="text-xs text-white/50 leading-relaxed mt-2 font-sans">
                Apakah Anda yakin ingin menonaktifkan member <strong className="text-[#bef264] font-mono font-semibold">{deactivatingMemberCode}</strong> ini? Status member akan diubah menjadi <span className="text-white/40">Tidak Aktif</span>.
              </p>

              {/* Choice Action buttons */}
              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  onClick={() => setDeactivatingMemberCode(null)}
                  className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmDeactivate}
                  className="py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-rose-500/10"
                >
                  Ya, Nonaktifkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer layout spacing */}
      <footer className="border-t border-white/5 bg-[#0a0a0b]/40 py-8 text-center text-[10px] text-white/30 font-mono uppercase tracking-widest leading-relaxed">
        © 2026 ISOKI Matchday • All Rights Reserved. Powered by Isoki Match for {clubConfig?.name || 'Garuda Bandung MFC'} • Hak Cipta Dilindungi
      </footer>
    </div>
  );
}
