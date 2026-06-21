import React, { useState, useEffect } from 'react';
import { Matchday, Member, MatchdayAttendance, Transaction } from '../types';
import { 
  Calendar, Clock, DollarSign, Plus, Check, RefreshCw, AlertCircle, 
  Trash2, TrendingUp, TrendingDown, Users, ChevronRight, CheckCircle2, 
  MapPin, HelpCircle, Activity, LayoutList, History, Award, Edit,
  Droplet, Shirt, Camera, Video, Car, PlusCircle, ArrowLeft, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchdayDashboardProps {
  members: Member[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction?: (id: string) => void;
  matchdays: Matchday[];
  setMatchdays: (mds: Matchday[]) => void;
  onBackToDashboard?: () => void;
  selectedMatchdayId?: string | null;
  setSelectedMatchdayId?: (id: string | null) => void;
}

export default function MatchdayDashboard({ 
  members, 
  transactions, 
  onAddTransaction,
  onDeleteTransaction,
  matchdays,
  setMatchdays,
  onBackToDashboard,
  selectedMatchdayId: propsSelectedMatchdayId,
  setSelectedMatchdayId: propsSetSelectedMatchdayId
}: MatchdayDashboardProps) {
  
  // Tabs within Matchday: 'schedule' (Buat Jadwal & Info) or 'monthly' (Laporan Bulanan)
  const [subTab, setSubTab] = useState<'schedule' | 'monthly'>('schedule');
  
  // Selected Matchday for editing/viewing details
  const [localSelectedMatchdayId, setLocalSelectedMatchdayId] = useState<string | null>(null);
  const selectedMatchdayId = propsSelectedMatchdayId !== undefined ? propsSelectedMatchdayId : localSelectedMatchdayId;
  const setSelectedMatchdayId = propsSetSelectedMatchdayId !== undefined ? propsSetSelectedMatchdayId : setLocalSelectedMatchdayId;

  const [matchdayToDeleteId, setMatchdayToDeleteId] = useState<string | null>(null);
  const [deleteRelatedTransactions, setDeleteRelatedTransactions] = useState(true);
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

  // Mobile layout helpers & inline headers
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [isHeaderEditing, setIsHeaderEditing] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'attendance' | 'ops'>('attendance');
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newTanggal, setNewTanggal] = useState('');
  const [newWaktuMulai, setNewWaktuMulai] = useState('14:00');
  const [newWaktuSelesai, setNewWaktuSelesai] = useState('16:00');
  const [newNama, setNewNama] = useState('');
  const [newLokasi, setNewLokasi] = useState('Siliwangi Futsal Arena');
  const [newJenisMatch, setNewJenisMatch] = useState<'Latihan Internal' | 'Sparing'>('Latihan Internal');
  const [newKategoriCabang, setNewKategoriCabang] = useState<string>('Futsal');
  
  // Default expenses for new matchday
  const [newSewa, setNewSewa] = useState(200000);
  const [newAir, setNewAir] = useState(40000);
  const [newParkir, setNewParkir] = useState(25000);
  const [newLaundry, setNewLaundry] = useState(20000);
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomAmount, setNewCustomAmount] = useState(0);

  // New specific expense fields & hour selections
  const [newSewaWasit, setNewSewaWasit] = useState(0);
  const [newFotografer, setNewFotografer] = useState(0);
  const [newVideografer, setNewVideografer] = useState(0);
  const [newDurasiJam, setNewDurasiJam] = useState(2);
  const [newSewaPerJam, setNewSewaPerJam] = useState(100000);

  // Unit details for new matchday
  const [newQtyAirMinum, setNewQtyAirMinum] = useState(2);
  const [newHargaAirMinumPerDus, setNewHargaAirMinumPerDus] = useState(20000);
  const [newQtyLaundryKg, setNewQtyLaundryKg] = useState(3);
  const [newHargaLaundryPerKg, setNewHargaLaundryPerKg] = useState(7000);
  const [newTarifWasitPerJam, setNewTarifWasitPerJam] = useState(0);
  const [newDurasiWasitJam, setNewDurasiWasitJam] = useState(2);
  const [newTarifFotograferPerJam, setNewTarifFotograferPerJam] = useState(0);
  const [newDurasiFotograferJam, setNewDurasiFotograferJam] = useState(2);
  const [newTarifVideograferPerJam, setNewTarifVideograferPerJam] = useState(0);
  const [newDurasiVideograferJam, setNewDurasiVideograferJam] = useState(2);

  // Edit matchday state
  const [isEditing, setIsEditing] = useState(false);
  const [editTanggal, setEditTanggal] = useState('');
  const [editWaktuMulai, setEditWaktuMulai] = useState('');
  const [editWaktuSelesai, setEditWaktuSelesai] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editJenisMatch, setEditJenisMatch] = useState<'Latihan Internal' | 'Sparing'>('Latihan Internal');
  const [editKategoriCabang, setEditKategoriCabang] = useState<string>('Futsal');
  const [editSewa, setEditSewa] = useState(0);
  const [editAir, setEditAir] = useState(0);
  const [editParkir, setEditParkir] = useState(0);
  const [editLaundry, setEditLaundry] = useState(0);
  const [editSewaWasit, setEditSewaWasit] = useState(0);
  const [editFotografer, setEditFotografer] = useState(0);
  const [editVideografer, setEditVideografer] = useState(0);
  const [editDurasiJam, setEditDurasiJam] = useState(2);
  const [editSewaPerJam, setEditSewaPerJam] = useState(100000);
  const [editCustomDesc, setEditCustomDesc] = useState('');
  const [editCustomAmount, setEditCustomAmount] = useState(0);
  const [editErrorText, setEditErrorText] = useState('');

  // Unit details for editing matchday
  const [editQtyAirMinum, setEditQtyAirMinum] = useState(2);
  const [editHargaAirMinumPerDus, setEditHargaAirMinumPerDus] = useState(20000);
  const [editQtyLaundryKg, setEditQtyLaundryKg] = useState(3);
  const [editHargaLaundryPerKg, setEditHargaLaundryPerKg] = useState(7000);
  const [editTarifWasitPerJam, setEditTarifWasitPerJam] = useState(0);
  const [editDurasiWasitJam, setEditDurasiWasitJam] = useState(2);
  const [editTarifFotograferPerJam, setEditTarifFotograferPerJam] = useState(0);
  const [editDurasiFotograferJam, setEditDurasiFotograferJam] = useState(2);
  const [editTarifVideograferPerJam, setEditTarifVideograferPerJam] = useState(0);
  const [editDurasiVideograferJam, setEditDurasiVideograferJam] = useState(2);

  // Auto calculate new expenses
  useEffect(() => {
    setNewSewa(newDurasiJam * newSewaPerJam);
  }, [newDurasiJam, newSewaPerJam]);

  useEffect(() => {
    setNewAir(newQtyAirMinum * newHargaAirMinumPerDus);
  }, [newQtyAirMinum, newHargaAirMinumPerDus]);

  useEffect(() => {
    setNewLaundry(newQtyLaundryKg * newHargaLaundryPerKg);
  }, [newQtyLaundryKg, newHargaLaundryPerKg]);

  useEffect(() => {
    setNewSewaWasit(newDurasiWasitJam * newTarifWasitPerJam);
  }, [newDurasiWasitJam, newTarifWasitPerJam]);

  useEffect(() => {
    setNewFotografer(newDurasiFotograferJam * newTarifFotograferPerJam);
  }, [newDurasiFotograferJam, newTarifFotograferPerJam]);

  useEffect(() => {
    setNewVideografer(newDurasiVideograferJam * newTarifVideograferPerJam);
  }, [newDurasiVideograferJam, newTarifVideograferPerJam]);

  // Auto calculate edit expenses
  useEffect(() => {
    setEditSewa(editDurasiJam * editSewaPerJam);
  }, [editDurasiJam, editSewaPerJam]);

  useEffect(() => {
    setEditAir(editQtyAirMinum * editHargaAirMinumPerDus);
  }, [editQtyAirMinum, editHargaAirMinumPerDus]);

  useEffect(() => {
    setEditLaundry(editQtyLaundryKg * editHargaLaundryPerKg);
  }, [editQtyLaundryKg, editHargaLaundryPerKg]);

  useEffect(() => {
    setEditSewaWasit(editDurasiWasitJam * editTarifWasitPerJam);
  }, [editDurasiWasitJam, editTarifWasitPerJam]);

  useEffect(() => {
    setEditFotografer(editDurasiFotograferJam * editTarifFotograferPerJam);
  }, [editDurasiFotograferJam, editTarifFotograferPerJam]);

  useEffect(() => {
    setEditVideografer(editDurasiVideograferJam * editTarifVideograferPerJam);
  }, [editDurasiVideograferJam, editTarifVideograferPerJam]);

  // Error logging
  const [errorText, setErrorText] = useState('');

  // Automatically open mobile detail panel when an external ID is selected from the Homepage matches
  useEffect(() => {
    if (propsSelectedMatchdayId) {
      setIsMobileDetailOpen(true);
    }
  }, [propsSelectedMatchdayId]);

  // Helper function to format currency
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  // Find nearest Sunday helper
  const getNearestUpcomingSunday = (): string => {
    const today = new Date();
    const resultDate = new Date(today);
    // Sunday is 0. If today is Sunday, we can schedule today or next Sunday
    const day = today.getDay();
    const distance = (7 - day) % 7;
    resultDate.setDate(today.getDate() + (distance === 0 ? 7 : distance));
    return resultDate.toISOString().split('T')[0];
  };

  // Quick initiate creation form with defaults
  const handleOpenCreate = () => {
    setNewTanggal(getNearestUpcomingSunday());
    setNewWaktuMulai('14:00');
    setNewWaktuSelesai('16:00');
    setNewNama(`Matchday #${matchdays.length + 1}`);
    setNewLokasi('Siliwangi Futsal Arena');
    setNewJenisMatch('Latihan Internal');
    setNewKategoriCabang('Futsal');
    setNewDurasiJam(2);
    setNewSewaPerJam(100000);
    setNewSewa(200000);
    setNewAir(40000);
    setNewQtyAirMinum(2);
    setNewHargaAirMinumPerDus(20000);
    setNewParkir(25000);
    setNewLaundry(21000);
    setNewQtyLaundryKg(3);
    setNewHargaLaundryPerKg(7000);
    setNewSewaWasit(0);
    setNewTarifWasitPerJam(0);
    setNewDurasiWasitJam(2);
    setNewFotografer(0);
    setNewTarifFotograferPerJam(0);
    setNewDurasiFotograferJam(2);
    setNewVideografer(0);
    setNewTarifVideograferPerJam(0);
    setNewDurasiVideograferJam(2);
    setNewCustomDesc('');
    setNewCustomAmount(0);
    setErrorText('');
    setIsCreating(true);
  };

  // Quick initiate edit form
  const handleOpenEdit = (md: Matchday) => {
    setEditTanggal(md.tanggal);
    setEditWaktuMulai(md.waktuMulai);
    setEditWaktuSelesai(md.waktuSelesai);
    setEditNama(md.namaMatchday);
    setEditLokasi(md.lokasi);
    setEditJenisMatch(md.jenisMatch ?? 'Latihan Internal');
    setEditKategoriCabang(md.kategoriCabang ?? 'Futsal');
    setEditDurasiJam(md.durasiJam ?? 2);
    setEditSewaPerJam(md.sewaPerJam ?? 100000);
    setEditSewa(md.sewaLapangan);
    setEditAir(md.airMinum);
    setEditQtyAirMinum(md.qtyAirMinum ?? 2);
    setEditHargaAirMinumPerDus(md.hargaAirMinumPerDus ?? 20000);
    setEditParkir(md.parkir);
    setEditLaundry(md.laundry);
    setEditQtyLaundryKg(md.qtyLaundryKg ?? 3);
    setEditHargaLaundryPerKg(md.hargaLaundryPerKg ?? 7000);
    setEditSewaWasit(md.sewaWasit ?? 0);
    setEditTarifWasitPerJam(md.tarifWasitPerJam ?? 0);
    setEditDurasiWasitJam(md.durasiWasitJam ?? 2);
    setEditFotografer(md.fotografer ?? 0);
    setEditTarifFotograferPerJam(md.tarifFotograferPerJam ?? 0);
    setEditDurasiFotograferJam(md.durasiFotograferJam ?? 2);
    setEditVideografer(md.videografer ?? 0);
    setEditTarifVideograferPerJam(md.tarifVideograferPerJam ?? 0);
    setEditDurasiVideograferJam(md.durasiVideograferJam ?? 2);
    setEditCustomDesc(md.customExpenseDeskripsi ?? '');
    setEditCustomAmount(md.customExpenseJumlah ?? 0);
    setEditErrorText('');
    setIsEditing(true);
  };

  // Save new Matchday schedule
  const handleSaveMatchday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTanggal) {
      setErrorText('Pilih tanggal pertandingan!');
      return;
    }

    // Prepare general attending members list
    // Pre-populate with all currently active members
    const activeMembers = members.filter(m => m.aktif);
    const attendanceList: MatchdayAttendance[] = activeMembers.map((m) => ({
      memberId: m.id,
      kodeMember: m.kodeMember,
      nama: m.nama,
      posisi: m.posisi,
      hadir: false,
      bayar: false,
      jumlahBayar: m.posisi === 'Keeper' ? 10000 : 15000 // Keeper standard 10k, Player 15k
    }));

    const newMatchday: Matchday = {
      id: 'match_' + Date.now(),
      tanggal: newTanggal,
      waktuMulai: newWaktuMulai,
      waktuSelesai: newWaktuSelesai,
      namaMatchday: newNama.trim() || `Matchday #${matchdays.length + 1}`,
      lokasi: newLokasi.trim() || 'Siliwangi Futsal Arena',
      sewaLapangan: newSewa,
      airMinum: newAir,
      qtyAirMinum: newQtyAirMinum,
      hargaAirMinumPerDus: newHargaAirMinumPerDus,
      parkir: newParkir,
      laundry: newLaundry,
      qtyLaundryKg: newQtyLaundryKg,
      hargaLaundryPerKg: newHargaLaundryPerKg,
      sewaWasit: newSewaWasit > 0 ? newSewaWasit : undefined,
      tarifWasitPerJam: newTarifWasitPerJam > 0 ? newTarifWasitPerJam : undefined,
      durasiWasitJam: newTarifWasitPerJam > 0 ? newDurasiWasitJam : undefined,
      fotografer: newFotografer > 0 ? newFotografer : undefined,
      tarifFotograferPerJam: newTarifFotograferPerJam > 0 ? newTarifFotograferPerJam : undefined,
      durasiFotograferJam: newTarifFotograferPerJam > 0 ? newDurasiFotograferJam : undefined,
      videografer: newVideografer > 0 ? newVideografer : undefined,
      tarifVideograferPerJam: newTarifVideograferPerJam > 0 ? newTarifVideograferPerJam : undefined,
      durasiVideograferJam: newTarifVideograferPerJam > 0 ? newDurasiVideograferJam : undefined,
      durasiJam: newDurasiJam,
      sewaPerJam: newSewaPerJam,
      customExpenseDeskripsi: newCustomDesc.trim() || undefined,
      customExpenseJumlah: newCustomAmount > 0 ? newCustomAmount : undefined,
      attendance: attendanceList,
      isSynced: false,
      jenisMatch: newJenisMatch,
      kategoriCabang: newKategoriCabang
    };

    const updated = [newMatchday, ...matchdays];
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
    setSelectedMatchdayId(newMatchday.id);
    setIsCreating(false);
  };

  // Update existing Matchday details
  const handleUpdateMatchday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTanggal) {
      setEditErrorText('Pilih tanggal pertandingan!');
      return;
    }

    const updated = matchdays.map((m) => {
      if (m.id === selectedMatchdayId) {
        return {
          ...m,
          tanggal: editTanggal,
          waktuMulai: editWaktuMulai,
          waktuSelesai: editWaktuSelesai,
          namaMatchday: editNama.trim() || m.namaMatchday,
          lokasi: editLokasi.trim() || m.lokasi,
          sewaLapangan: editSewa,
          airMinum: editAir,
          qtyAirMinum: editQtyAirMinum,
          hargaAirMinumPerDus: editHargaAirMinumPerDus,
          parkir: editParkir,
          laundry: editLaundry,
          qtyLaundryKg: editQtyLaundryKg,
          hargaLaundryPerKg: editHargaLaundryPerKg,
          sewaWasit: editSewaWasit > 0 ? editSewaWasit : undefined,
          tarifWasitPerJam: editTarifWasitPerJam > 0 ? editTarifWasitPerJam : undefined,
          durasiWasitJam: editTarifWasitPerJam > 0 ? editDurasiWasitJam : undefined,
          fotografer: editFotografer > 0 ? editFotografer : undefined,
          tarifFotograferPerJam: editTarifFotograferPerJam > 0 ? editTarifFotograferPerJam : undefined,
          durasiFotograferJam: editTarifFotograferPerJam > 0 ? editDurasiFotograferJam : undefined,
          videografer: editVideografer > 0 ? editVideografer : undefined,
          tarifVideograferPerJam: editTarifVideograferPerJam > 0 ? editTarifVideograferPerJam : undefined,
          durasiVideograferJam: editTarifVideograferPerJam > 0 ? editDurasiVideograferJam : undefined,
          durasiJam: editDurasiJam,
          sewaPerJam: editSewaPerJam,
          customExpenseDeskripsi: editCustomDesc.trim() || undefined,
          customExpenseJumlah: editCustomAmount > 0 ? editCustomAmount : undefined,
          jenisMatch: editJenisMatch,
          kategoriCabang: editKategoriCabang,
        };
      }
      return m;
    });

    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
    setIsEditing(false);
  };

  // Delete Matchday
  const handleDeleteMatchday = (id: string) => {
    setMatchdayToDeleteId(id);
  };

  const confirmDeleteMatchday = () => {
    if (matchdayToDeleteId) {
      const targetMatch = matchdays.find(m => m.id === matchdayToDeleteId);
      
      // If the session was synchronized and the user chose to also delete associated financial records
      if (targetMatch && targetMatch.isSynced && deleteRelatedTransactions && onDeleteTransaction) {
        const matchName = targetMatch.namaMatchday || 'Matchday';
        // Clean up both income and expense entries matching the date and description
        const relatedTxs = transactions.filter(tx => 
          tx.tanggal === targetMatch.tanggal && 
          tx.deskripsi.includes(matchName)
        );
        
        relatedTxs.forEach(tx => {
          onDeleteTransaction(tx.id);
        });
      }

      const updated = matchdays.filter(m => m.id !== matchdayToDeleteId);
      setMatchdays(updated);
      localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
      setIsMobileDetailOpen(false); // Reset mobile view to go back to list
      if (selectedMatchdayId === matchdayToDeleteId) {
        setSelectedMatchdayId(updated.length > 0 ? updated[0].id : null);
      }
      setMatchdayToDeleteId(null);
    }
  };

  // Toggle Attendee attendance
  const handleToggleAttendance = (matchdayId: string, memberId: string) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        const updatedAttendance = m.attendance.map((att) => {
          if (att.memberId === memberId) {
            const nextHadir = !att.hadir;
            // Auto mark paid for simplicity when marking attending (or default)
            return {
              ...att,
              hadir: nextHadir,
              bayar: nextHadir ? att.bayar : false // clear paid state if marking absent
            };
          }
          return att;
        });
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  // Toggle Attendee payment status
  const handleTogglePayment = (matchdayId: string, memberId: string) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        const updatedAttendance = m.attendance.map((att) => {
          if (att.memberId === memberId) {
            return { ...att, bayar: !att.bayar };
          }
          return att;
        });
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  // Adjust custom payment amount for a specific member in this matchday
  const handleUpdatePaymentAmount = (matchdayId: string, memberId: string, amnt: number) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        const updatedAttendance = m.attendance.map((att) => {
          if (att.memberId === memberId) {
            return { ...att, jumlahBayar: amnt };
          }
          return att;
        });
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  // Quick mark actions
  const handleQuickPresenceAll = (matchdayId: string, status: boolean) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        const updatedAttendance = m.attendance.map((att) => ({
          ...att,
          hadir: status,
          bayar: status ? att.bayar : false
        }));
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  const handleQuickPaymentAll = (matchdayId: string, status: boolean) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        const updatedAttendance = m.attendance.map((att) => ({
          ...att,
          bayar: att.hadir ? status : false // only mark paid if they are set to present
        }));
        return { ...m, attendance: updatedAttendance };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  // Edit Matchday Operational Expenditure parameters (Sewa, Air, Parkir, dll.)
  const handleUpdateMatchdayCost = (matchdayId: string, field: string, amount: number) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        return { ...m, [field]: amount };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  const handleUpdateMatchdayCustomCost = (matchdayId: string, desc: string, amount: number) => {
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        return { 
          ...m, 
          customExpenseDeskripsi: desc || undefined,
          customExpenseJumlah: amount > 0 ? amount : undefined
        };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
  };

  // Synchronize entire matchday financials to Global Ledger
  const handleSyncToGlobalLedger = (matchdayId: string) => {
    const md = matchdays.find(m => m.id === matchdayId);
    if (!md) return;

    if (md.isSynced) {
      alert('Matchday ini sudah disinkronisasikan ke Buku Kas Utama sebelumnya!');
      return;
    }

    // 1. Calculate Revenue (Total Iuran Collected from Present & Paid members)
    const paidList = md.attendance.filter(att => att.hadir && att.bayar);
    const totalDues = paidList.reduce((acc, curr) => acc + curr.jumlahBayar, 0);

    // 2. Calculate Total Expenses
    const totalExpenses = 
      md.sewaLapangan + 
      md.airMinum + 
      md.parkir + 
      md.laundry + 
      (md.sewaWasit || 0) + 
      (md.fotografer || 0) + 
      (md.videografer || 0) + 
      (md.customExpenseJumlah || 0);

    const matchName = md.namaMatchday || 'Matchday';

    // 3. Register Pemasukan
    if (totalDues > 0) {
      onAddTransaction({
        tanggal: md.tanggal,
        deskripsi: `Pemasukan Iuran ${matchName} (${paidList.length} Pemain)`,
        jumlah: totalDues,
        tipe: 'Pemasukan',
        kategori: 'Iuran Member'
      });
    }

    // 4. Register Pengeluaran (divided as 1 bundled transaction or specific ones)
    if (totalExpenses > 0) {
      onAddTransaction({
        tanggal: md.tanggal,
        deskripsi: `Sewa & Operasional Lapangan - ${matchName}`,
        jumlah: totalExpenses,
        tipe: 'Pengeluaran',
        kategori: 'Sewa Lapangan'
      });
    }

    // Flag Matchday status as Synced
    const updated = matchdays.map((m) => {
      if (m.id === matchdayId) {
        return { ...m, isSynced: true };
      }
      return m;
    });
    setMatchdays(updated);
    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));

    alert(`Sukses sinkronisasi iuran & pengeluaran untuk ${matchName} ke Buku Kas Utama!`);
  };

  // active Matchday data calculations
  const activeMatchday = matchdays.find(m => m.id === selectedMatchdayId);

  const getMemberPhone = (memberId: string, kodeMember: string): string => {
    const mb = members.find(m => m.id === memberId || m.kodeMember === kodeMember);
    return mb ? mb.noHp : '';
  };

  const filteredAttendance = activeMatchday?.attendance ? activeMatchday.attendance.filter((att) => {
    if (!attendanceSearchQuery) return true;
    const query = attendanceSearchQuery.toLowerCase();
    const phone = getMemberPhone(att.memberId, att.kodeMember);
    return (
      att.nama.toLowerCase().includes(query) ||
      att.kodeMember.toLowerCase().includes(query) ||
      phone.toLowerCase().includes(query)
    );
  }) : [];
  
  // Calculate specific Matchday financials
  const getMatchdayFinances = (md: Matchday) => {
    const attendingCount = md.attendance.filter(att => att.hadir).length;
    const paidList = md.attendance.filter(att => att.hadir && att.bayar);
    const paidCount = paidList.length;
    const totalCollection = paidList.reduce((acc, curr) => acc + curr.jumlahBayar, 0);
    const totalExpenses = 
      md.sewaLapangan + 
      md.airMinum + 
      md.parkir + 
      md.laundry + 
      (md.sewaWasit || 0) + 
      (md.fotografer || 0) + 
      (md.videografer || 0) + 
      (md.customExpenseJumlah || 0);
    const netProfit = totalCollection - totalExpenses;
    return {
      attendingCount,
      paidCount,
      totalCollection,
      totalExpenses,
      netProfit,
    };
  };

  // Calculate Cumulative/Global Matchdays Summary Stats
  const globalMatchdayStats = () => {
    let totIncome = 0;
    let totExpense = 0;
    let totAttendance = 0;

    matchdays.forEach(md => {
      const stats = getMatchdayFinances(md);
      totIncome += stats.totalCollection;
      totExpense += stats.totalExpenses;
      totAttendance += stats.attendingCount;
    });

    const avgAttendance = matchdays.length > 0 ? Math.round(totAttendance / matchdays.length) : 0;

    return {
      totalMatchdays: matchdays.length,
      totalIncome: totIncome,
      totalExpense: totExpense,
      balance: totIncome - totExpense,
      avgAttendance
    };
  };

  // Group Matchdays by Month for Bulletins
  const getMonthlyBreakdown = () => {
    const groups: { [key: string]: Matchday[] } = {};
    
    matchdays.forEach(md => {
      const dateObj = new Date(md.tanggal);
      const year = dateObj.getFullYear();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = monthNames[dateObj.getMonth()];
      const key = `${monthName} ${year}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(md);
    });

    return Object.keys(groups).map(monthKey => {
      const matches = groups[monthKey];
      let matchIncome = 0;
      let matchExpense = 0;
      let attendantsSum = 0;
      
      matches.forEach(m => {
        const stats = getMatchdayFinances(m);
        matchIncome += stats.totalCollection;
        matchExpense += stats.totalExpenses;
        attendantsSum += stats.attendingCount;
      });

      const avgPresence = matches.length > 0 ? Math.round((attendantsSum / matches.length)) : 0;

      return {
        month: monthKey,
        matchCount: matches.length,
        income: matchIncome,
        expenses: matchExpense,
        net: matchIncome - matchExpense,
        avgAttending: avgPresence
      };
    });
  };

  const globalStats = globalMatchdayStats();
  const monthlyData = getMonthlyBreakdown();

  return (
    <div className="space-y-6">
      
      {/* Top Header Row with Back navigation & Title */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white rounded-xl cursor-pointer transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h3 className="text-lg font-bold font-sans text-white tracking-tight">Kas Matchday</h3>
            <p className="text-xs text-white/50 mt-1 font-sans">Kelola jadwal sesi dan biaya operasional.</p>
          </div>
        </div>
      </div>
      
      {/* Visual Header Grid Panel - Consolidated into a single sleek board to save premium mobile vertical space */}
      <div className="bg-[#111112] border border-white/5 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 md:gap-4 md:divide-x divide-white/5">
          {/* Total Events */}
          <div className="px-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Total Matchday</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black text-white">{globalStats.totalMatchdays}</span>
              <span className="text-[10px] text-white/40 font-semibold uppercase">Sesi</span>
            </div>
          </div>

          {/* Total Matchday Income */}
          <div className="px-2 md:pl-6">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#bef264] block">Iuran Terkumpul</span>
            <div className="mt-1">
              <span className="text-sm sm:text-base font-bold text-white">{formatRupiah(globalStats.totalIncome)}</span>
            </div>
          </div>

          {/* Total Matchday Spending */}
          <div className="px-2 md:pl-6">
            <span className="text-[9px] font-mono uppercase tracking-widest text-rose-455 block">Total Operasional</span>
            <div className="mt-1">
              <span className="text-sm sm:text-base font-bold text-white">{formatRupiah(globalStats.totalExpense)}</span>
            </div>
          </div>

          {/* Cumulative Profit or Deficit */}
          <div className="px-2 md:pl-6">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 block">Saldo Lapangan</span>
            <div className="mt-1">
              <span className={`text-sm sm:text-base font-black ${globalStats.balance >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                {globalStats.balance >= 0 ? '+' : ''}{formatRupiah(globalStats.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sub-navigation Headers */}
      <div className="flex items-center justify-between border-b border-white/5 p-0.5 gap-2">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubTab('schedule')}
            className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-t-2xl border-b-2 transition-all cursor-pointer shrink-0 ${
              subTab === 'schedule'
                ? 'border-[#bef264] text-[#bef264] bg-white/[0.02]'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span>Jadwal Sesi</span>
          </button>
          <button
            onClick={() => setSubTab('monthly')}
            className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-t-2xl border-b-2 transition-all cursor-pointer shrink-0 ${
              subTab === 'monthly'
                ? 'border-[#bef264] text-[#bef264] bg-white/[0.02]'
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>Analisis</span>
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#bef264] hover:bg-brand-hover text-black font-extrabold rounded-xl text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-[#bef264]/10 select-none hover:scale-105 active:scale-95"
          title="Buat Sesi Pertandingan Baru"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3px]" />
          <span>Buat Sesi</span>
        </button>
      </div>

      {/* Sub Tabs Renderers */}
      {subTab === 'schedule' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: SCHEDULE SELECTOR RAIL (width 4/12) */}
          <div className={`lg:col-span-4 space-y-4 ${isMobileDetailOpen ? 'hidden md:block' : 'block'}`}>
            
            {/* Header control box */}
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#bef264]/80">
                Pilih Sesi ({matchdays.length})
              </span>
            </div>

            {/* List of Matchdays */}
            {matchdays.length === 0 ? (
              <div className="bg-[#111112] border border-white/5 rounded-3xl p-8 text-center text-xs text-white/30 font-sans">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-white/20" />
                Belum ada jadwal pertandingan yang dibuat.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {matchdays.map((md) => {
                  const mFin = getMatchdayFinances(md);
                  const isSelected = selectedMatchdayId === md.id;
                  return (
                    <div
                      key={md.id}
                      onClick={() => {
                        setSelectedMatchdayId(md.id);
                        setIsMobileDetailOpen(true);
                        setIsHeaderEditing(false); // break edit state when switching matchday
                        setActiveDetailsTab('attendance'); // Reset inner tab to attendance
                      }}
                      className={`relative overflow-hidden w-full p-4 border rounded-2xl text-left cursor-pointer transition-all duration-200 hover:bg-white/[0.02] ${
                        isSelected 
                          ? 'bg-[#18181b]/90 border-[#bef264] ring-1 ring-[#bef264]/20' 
                          : 'bg-[#111112] border-white/5'
                      }`}
                    >
                      {md.isSynced && (
                        <div className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-500/10">
                          Synced
                        </div>
                      )}

                      <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase block mb-1.5">
                        {md.tanggal} • {md.waktuMulai}-{md.waktuSelesai}
                      </span>

                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                        <span className={`text-[7px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border tracking-wide shrink-0 ${
                          (md.jenisMatch || 'Latihan Internal') === 'Sparing'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        }`}>
                          {md.jenisMatch || 'Latihan Internal'}
                        </span>
                        <span className="text-[7px] font-mono font-extrabold uppercase px-1 py-0.2 rounded border tracking-wide shrink-0 bg-emerald-500/10 text-[#bef264] border-emerald-500/20" style={{ color: 'var(--brand-color)', borderColor: 'var(--brand-color)' }}>
                          {md.kategoriCabang || 'Futsal'}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-white transition-colors">{md.namaMatchday}</h5>
                      
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/50">
                        <MapPin className="h-3 w-3 shrink-0 text-white/30" />
                        <span className="truncate">{md.lokasi}</span>
                      </div>

                      {/* Brief financial micro-status of this matchday */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px]">
                        <span className="text-white/40">
                          Presensi: <strong className="text-white font-sans">{mFin.attendingCount}</strong> ({mFin.paidCount} Bayar)
                        </span>
                        <span className={`font-mono font-bold ${mFin.netProfit >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                          {mFin.netProfit >= 0 ? '+' : ''}{formatRupiah(mFin.netProfit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: SELECTED MATCHDAY DETAILS CONTROL BOARD (width 8/12) */}
          <div className={`lg:col-span-8 ${isMobileDetailOpen ? 'block' : 'hidden md:block'}`}>
            <AnimatePresence mode="wait">
              {activeMatchday ? (
                <motion.div
                  key={activeMatchday.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Card Section Header */}
                  {isMobileDetailOpen && (
                    <button
                      onClick={() => setIsMobileDetailOpen(false)}
                      className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/5 text-[#bef264] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider mb-2 transition-all cursor-pointer"
                    >
                      ← Kembali ke Daftar Sesi
                    </button>
                  )}

                  <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-[#bef264]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    {isHeaderEditing ? (
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h4 className="text-xs font-mono text-[#bef264] uppercase tracking-widest font-bold">Ubah Informasi Sesi</h4>
                          <span className="text-[10px] font-mono text-white/30">Edit Langsung di Sini</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Nama Sesi</label>
                            <input
                              type="text"
                              value={editNama}
                              onChange={(e) => setEditNama(e.target.value)}
                              className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Lokasi Lapangan</label>
                            <input
                              type="text"
                              value={editLokasi}
                              onChange={(e) => setEditLokasi(e.target.value)}
                              className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                            />
                          </div>
                        </div>

                        {/* Match Type & Pitch Category selectors inside editing header */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tipe Pertandingan</label>
                            <select
                              value={editJenisMatch}
                              onChange={(e) => setEditJenisMatch(e.target.value as 'Latihan Internal' | 'Sparing')}
                              className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264] cursor-pointer"
                            >
                              <option value="Latihan Internal">Latihan Internal</option>
                              <option value="Sparing">Sparing</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Cabang Olahraga / Kategori</label>
                            <input
                              type="text"
                              placeholder="Contoh: Futsal, Basket, Badminton, dll."
                              value={editKategoriCabang}
                              onChange={(e) => setEditKategoriCabang(e.target.value)}
                              className="w-full px-3 py-2 bg-black border border-white/10 focus:border-brand rounded-xl text-xs text-white focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tanggal</label>
                            <input
                              type="date"
                              value={editTanggal}
                              onChange={(e) => setEditTanggal(e.target.value)}
                              className="w-full px-2 py-2 bg-black border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Waktu Mulai</label>
                            <input
                              type="time"
                              required
                              value={editWaktuMulai}
                              onChange={(e) => setEditWaktuMulai(e.target.value)}
                              className="w-full px-2 py-2 bg-black border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Waktu Selesai</label>
                            <input
                              type="time"
                              required
                              value={editWaktuSelesai}
                              onChange={(e) => setEditWaktuSelesai(e.target.value)}
                              className="w-full px-2 py-2 bg-black border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setIsHeaderEditing(false)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = matchdays.map((m) => {
                                if (m.id === selectedMatchdayId) {
                                  return {
                                    ...m,
                                    namaMatchday: editNama.trim(),
                                    lokasi: editLokasi.trim(),
                                    tanggal: editTanggal,
                                    waktuMulai: editWaktuMulai,
                                    waktuSelesai: editWaktuSelesai,
                                    jenisMatch: editJenisMatch,
                                    kategoriCabang: editKategoriCabang,
                                  };
                                }
                                return m;
                              });
                              setMatchdays(updated);
                              localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                              setIsHeaderEditing(false);
                            }}
                            className="px-3 py-1.5 bg-[#bef264] hover:bg-brand-hover text-black rounded-xl text-[10px] uppercase font-black tracking-wider cursor-pointer transition-colors"
                          >
                            Simpan Perubahan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-[10px] font-mono bg-[#bef264]/10 text-[#bef264] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              Matchday Aktif
                            </span>
                            <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider shrink-0 ${
                              (activeMatchday.jenisMatch || 'Latihan Internal') === 'Sparing'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}>
                              {activeMatchday.jenisMatch || 'Latihan Internal'}
                            </span>
                            <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border tracking-wider shrink-0 bg-emerald-500/10 text-[#bef264] border-emerald-500/20" style={{ color: 'var(--brand-color)', borderColor: 'var(--brand-color)' }}>
                              🏆 {activeMatchday.kategoriCabang || 'Futsal'}
                            </span>
                            <span className="text-xs text-white/40 font-mono">{activeMatchday.tanggal} • {activeMatchday.waktuMulai} - {activeMatchday.waktuSelesai} WIB</span>
                          </div>
                          <h3 className="text-lg font-black text-white mt-1.5 tracking-tight font-sans">
                            {activeMatchday.namaMatchday}
                          </h3>
                          <p className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                            {activeMatchday.lokasi}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Synced Stamp or Button */}
                          {activeMatchday.isSynced ? (
                            <div className="flex items-center gap-1.5 py-2 px-3.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl scroll-p-1 select-none">
                              <CheckCircle2 className="h-4 w-4" />
                              Selesai Sinkron
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSyncToGlobalLedger(activeMatchday.id)}
                              className="flex items-center gap-1.5 py-2 px-4 bg-[#bef264] hover:bg-brand-hover text-black text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                              title="Masukkan pendapatan iuran dan pengeluaran sewa sesi ini ke pembukuan utama"
                            >
                              <RefreshCw className="h-3.5 w-3.5 stroke-[2.5px]" />
                              Sinkron ke Kas
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditNama(activeMatchday.namaMatchday);
                              setEditLokasi(activeMatchday.lokasi);
                              setEditTanggal(activeMatchday.tanggal);
                              setEditWaktuMulai(activeMatchday.waktuMulai);
                              setEditWaktuSelesai(activeMatchday.waktuSelesai);
                              setIsHeaderEditing(true);
                            }}
                            className="bg-white/5 p-2.5 border border-white/5 hover:border-[#bef264]/20 hover:bg-[#bef264]/10 text-white hover:text-[#bef264] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all text-xs"
                            title="Edit Sesi"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Ubah</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMatchday(activeMatchday.id)}
                            className="bg-white/5 p-2.5 border border-white/5 hover:border-rose-500/20 hover:bg-rose-500/10 text-white/30 hover:text-rose-400 rounded-xl cursor-pointer transition-all"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DETAIL SESSION INNER SUB-TABS */}
                  <div className="flex bg-[#111112]/80 border border-white/5 rounded-2xl p-1 max-w-sm w-full gap-1 shadow-inner backdrop-blur-sm mb-6 select-none">
                    <button
                      type="button"
                      onClick={() => setActiveDetailsTab('attendance')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        activeDetailsTab === 'attendance'
                          ? 'bg-[#bef264] text-black font-extrabold shadow-sm shadow-[#bef264]/10'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Presensi & Iuran ({activeMatchday.attendance?.length || 0})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailsTab('ops')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        activeDetailsTab === 'ops'
                          ? 'bg-[#bef264] text-black font-extrabold shadow-sm shadow-[#bef264]/10'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      <span>Biaya Ops & Ringkasan</span>
                    </button>
                  </div>

                  {/* ACTIVE MEETING ATTENDANCE & PAYMENTS PANEL */}
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* ATTENDANCE CONTROLLERS (FULL WIDTH) */}
                    <div className={`${activeDetailsTab === 'attendance' ? 'block' : 'hidden'} bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-md w-full`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                          <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#bef264]">Presensi & Iuran Pemain</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">Centang yang hadir bermain & tandai jika lunas membayar iuran.</p>
                        </div>

                        {/* Batch Action Helpers */}
                        <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider">
                          <button
                            onClick={() => handleQuickPresenceAll(activeMatchday.id, true)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-white/60 font-semibold cursor-pointer"
                          >
                            Hadir Semua
                          </button>
                          <button
                            onClick={() => handleQuickPaymentAll(activeMatchday.id, true)}
                            className="px-2 py-1 bg-[#bef264]/10 hover:bg-[#bef264]/20 rounded border border-[#bef264]/10 text-[#bef264] font-semibold cursor-pointer"
                          >
                            Lunas Semua
                          </button>
                        </div>
                      </div>

                      {/* Search Bar for Member Rosters */}
                      <div className="mb-4 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Search className="h-3.5 w-3.5 text-white/30" />
                        </div>
                        <input
                          type="text"
                          placeholder="Cari member by kode, nama, atau no HP..."
                          value={attendanceSearchQuery}
                          onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-9 py-2.5 bg-black border border-white/5 rounded-2xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bef264]"
                        />
                        {attendanceSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setAttendanceSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Members list checkbox rows */}
                      {activeMatchday.attendance && activeMatchday.attendance.length === 0 ? (
                        <div className="text-center py-10 text-xs text-white/20 font-sans">
                          Roster kosong atau semua member tidak aktif.
                        </div>
                      ) : filteredAttendance.length === 0 ? (
                        <div className="text-center py-10 text-xs text-white/30 font-sans">
                          Member dengan kata kunci "{attendanceSearchQuery}" tidak ditemukan.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto pr-1">
                          {filteredAttendance.map((att) => (
                            <div 
                              key={att.memberId} 
                              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                            >
                              {/* Left details */}
                              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                                {/* Photo Initial fallback */}
                                <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0 select-none">
                                  {att.nama.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-white/95 truncate font-sans text-xs sm:text-sm">{att.nama}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[9px] font-mono text-white/40">{att.kodeMember}</span>
                                    <span className="text-[9px] font-mono text-neutral-500">({getMemberPhone(att.memberId, att.kodeMember) || '-'})</span>
                                    <span className={`text-[8px] font-mono font-extrabold px-1 rounded-sm tracking-wide ${
                                      att.posisi === 'Keeper' 
                                        ? 'bg-purple-950 text-purple-400' 
                                        : 'bg-indigo-950 text-indigo-400'
                                    }`}>
                                      {att.posisi === 'Keeper' ? 'GK (10rb)' : 'OUT (15rb)'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right interactive controllers & iuran value modifier */}
                              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-white/[0.02] sm:border-t-0 shrink-0">
                                <div className="flex items-center gap-2">
                                  {/* Presence Toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAttendance(activeMatchday.id, att.memberId)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase transition-all tracking-wider cursor-pointer select-none ${
                                      att.hadir
                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                        : 'bg-black border-white/5 text-white/20 hover:text-white/40'
                                    }`}
                                  >
                                    {att.hadir ? '✓ Hadir' : 'Absen'}
                                  </button>

                                  {/* Payment Toggle */}
                                  <button
                                    type="button"
                                    disabled={!att.hadir}
                                    onClick={() => handleTogglePayment(activeMatchday.id, att.memberId)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase transition-all tracking-wider cursor-pointer select-none ${
                                      att.bayar
                                        ? 'bg-[#bef264]/15 border-[#bef264]/30 text-[#bef264]'
                                        : 'bg-black border-white/5 text-white/20 hover:text-white/40 disabled:opacity-30 disabled:cursor-not-allowed'
                                    }`}
                                  >
                                    {att.bayar ? '💰 Lunas' : 'Belum'}
                                  </button>
                                </div>

                                {/* Edit custom dues amount inline if needed */}
                                {att.hadir && (
                                  <div className="relative w-20 shrink-0">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-[8px] font-mono text-white/30">Rp</span>
                                    <input
                                      type="number"
                                      value={att.jumlahBayar}
                                      onChange={(e) => handleUpdatePaymentAmount(activeMatchday.id, att.memberId, Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-full pl-5 pr-1.5 py-1 bg-black border border-white/10 rounded-lg text-[10px] text-white/80 text-right font-mono focus:outline-none focus:border-[#bef264]"
                                      title="Sesuaikan nominal tiket iuran"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* EXPENSES ADJUSTER & SESSION SUMMARY P&L (FULL WIDTH) */}
                    <div className={`${activeDetailsTab === 'ops' ? 'block' : 'hidden'} space-y-6 w-full`}>
                      
                      {/* Operational Expenditures Editor */}
                      <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 shadow-md">
                        <div>
                          <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#bef264]">Pengeluaran & Peran Ops</h4>
                          <p className="text-[10px] text-white/40 mt-0.5">Kelola seluruh rincian pengeluaran operasional secara terperinci.</p>
                        </div>
                        
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto pr-1 mt-6">
                          {/* 1. SEWA LAPANGAN */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs first:pt-0">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Activity className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Sewa Lapangan</p>
                                <p className="text-[9px] font-mono text-white/40">LAPANGAN FUTSAL</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Duration Selector */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Durasi</span>
                                <select
                                  value={activeMatchday.durasiJam ?? 2}
                                  onChange={(e) => {
                                    const dur = parseInt(e.target.value) || 2;
                                    const rate = activeMatchday.sewaPerJam ?? 100000;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, durasiJam: dur, sewaLapangan: Math.round(dur * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                                >
                                  <option value="1" className="bg-black text-white">1 Jam</option>
                                  <option value="2" className="bg-black text-white">2 Jam</option>
                                  <option value="3" className="bg-black text-white">3 Jam</option>
                                  <option value="4" className="bg-black text-white">4 Jam</option>
                                </select>
                              </div>

                              {/* Price per Hour Input */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Sewa/Jam</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.sewaPerJam ?? 100000}
                                  onChange={(e) => {
                                    const rate = Math.max(0, parseInt(e.target.value) || 0);
                                    const dur = activeMatchday.durasiJam ?? 2;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, sewaPerJam: rate, sewaLapangan: Math.round(dur * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-20 text-right font-semibold"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.sewaLapangan)}</span>
                            </div>
                          </div>

                          {/* 2. AIR MINERAL */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Droplet className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Air Mineral</p>
                                <p className="text-[9px] font-mono text-white/40">KONSUMSI TIM</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Quantity Input */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Qty</span>
                                <input
                                  type="number"
                                  value={activeMatchday.qtyAirMinum ?? 2}
                                  onChange={(e) => {
                                    const qty = Math.max(0, parseInt(e.target.value) || 0);
                                    const price = activeMatchday.hargaAirMinumPerDus ?? 20000;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, qtyAirMinum: qty, airMinum: Math.round(qty * price) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-10 text-center"
                                />
                                <span className="text-[10px] text-white/30 font-mono">Dus</span>
                              </div>

                              {/* Price per Box Input */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Harga/Dus</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.hargaAirMinumPerDus ?? 20000}
                                  onChange={(e) => {
                                    const price = Math.max(0, parseInt(e.target.value) || 0);
                                    const qty = activeMatchday.qtyAirMinum ?? 2;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, hargaAirMinumPerDus: price, airMinum: Math.round(qty * price) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-16 text-right font-semibold"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.airMinum)}</span>
                            </div>
                          </div>

                          {/* 3. JERSEY LAUNDRY */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Shirt className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Jersey Laundry</p>
                                <p className="text-[9px] font-mono text-white/40">OPERASIONAL CUCI</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Quantity Weight Input */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Berat</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={activeMatchday.qtyLaundryKg ?? 3}
                                  onChange={(e) => {
                                    const qty = Math.max(0, parseFloat(e.target.value) || 0);
                                    const price = activeMatchday.hargaLaundryPerKg ?? 7000;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, qtyLaundryKg: qty, laundry: Math.round(qty * price) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-12 text-center"
                                />
                                <span className="text-[10px] text-white/30 font-mono">Kg</span>
                              </div>

                              {/* Price per Kg Input */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Harga/Kg</span>
                                <span className="text-[10px] text-white/30 font-mono font-semibold">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.hargaLaundryPerKg ?? 7000}
                                  onChange={(e) => {
                                    const price = Math.max(0, parseInt(e.target.value) || 0);
                                    const qty = activeMatchday.qtyLaundryKg ?? 3;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, hargaLaundryPerKg: price, laundry: Math.round(qty * price) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-16 text-right font-semibold"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.laundry)}</span>
                            </div>
                          </div>

                          {/* 4. SEWA WASIT */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Award className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Wasit Sesi</p>
                                <p className="text-[9px] font-mono text-white/40">PERAN WASIT</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Duration Selector */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Jam</span>
                                <select
                                  value={activeMatchday.durasiWasitJam ?? 2}
                                  onChange={(e) => {
                                    const jam = parseInt(e.target.value) || 0;
                                    const rate = activeMatchday.tarifWasitPerJam ?? 0;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, durasiWasitJam: jam, sewaWasit: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                                >
                                  <option value="0" className="bg-black text-white">0 Jam</option>
                                  <option value="1" className="bg-black text-white">1 Jam</option>
                                  <option value="2" className="bg-black text-white">2 Jam</option>
                                  <option value="3" className="bg-black text-white">3 Jam</option>
                                  <option value="4" className="bg-black text-white">4 Jam</option>
                                </select>
                              </div>

                              {/* Tarif Per Jam */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Tarif/Jam</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.tarifWasitPerJam ?? 0}
                                  onChange={(e) => {
                                    const rate = Math.max(0, parseInt(e.target.value) || 0);
                                    const jam = activeMatchday.durasiWasitJam ?? 2;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, tarifWasitPerJam: rate, sewaWasit: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-16 text-right font-semibold"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.sewaWasit ?? 0)}</span>
                            </div>
                          </div>

                          {/* 5. FOTOGRAFER */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Camera className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Fotografer</p>
                                <p className="text-[9px] font-mono text-white/40">PERAN MEDIA</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Duration Selector */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Jam</span>
                                <select
                                  value={activeMatchday.durasiFotograferJam ?? 2}
                                  onChange={(e) => {
                                    const jam = parseInt(e.target.value) || 0;
                                    const rate = activeMatchday.tarifFotograferPerJam ?? 0;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, durasiFotograferJam: jam, fotografer: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                                >
                                  <option value="0" className="bg-black text-white">0 Jam</option>
                                  <option value="1" className="bg-black text-white">1 Jam</option>
                                  <option value="2" className="bg-black text-white">2 Jam</option>
                                  <option value="3" className="bg-black text-white">3 Jam</option>
                                  <option value="4" className="bg-black text-white">4 Jam</option>
                                </select>
                              </div>

                              {/* Tarif Per Jam */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Tarif/Jam</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.tarifFotograferPerJam ?? 0}
                                  onChange={(e) => {
                                    const rate = Math.max(0, parseInt(e.target.value) || 0);
                                    const jam = activeMatchday.durasiFotograferJam ?? 2;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, tarifFotograferPerJam: rate, fotografer: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-16 text-right font-semibold"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.fotografer ?? 0)}</span>
                            </div>
                          </div>

                          {/* 6. VIDEOGRAFER */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Video className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Videografer</p>
                                <p className="text-[9px] font-mono text-white/40">PERAN MEDIA</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Duration Selector */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Jam</span>
                                <select
                                  value={activeMatchday.durasiVideograferJam ?? 2}
                                  onChange={(e) => {
                                    const jam = parseInt(e.target.value) || 0;
                                    const rate = activeMatchday.tarifVideograferPerJam ?? 0;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, durasiVideograferJam: jam, videografer: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                                >
                                  <option value="0" className="bg-black text-white">0 Jam</option>
                                  <option value="1" className="bg-black text-white">1 Jam</option>
                                  <option value="2" className="bg-black text-white">2 Jam</option>
                                  <option value="3" className="bg-black text-white">3 Jam</option>
                                  <option value="4" className="bg-black text-white">4 Jam</option>
                                </select>
                              </div>

                              {/* Tarif Per Jam */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Tarif/Jam</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.tarifVideograferPerJam ?? 0}
                                  onChange={(e) => {
                                    const rate = Math.max(0, parseInt(e.target.value) || 0);
                                    const jam = activeMatchday.durasiVideograferJam ?? 2;
                                    const updated = matchdays.map((m) => {
                                      if (m.id === activeMatchday.id) {
                                        return { ...m, tarifVideograferPerJam: rate, videografer: Math.round(jam * rate) };
                                      }
                                      return m;
                                    });
                                    setMatchdays(updated);
                                    localStorage.setItem('isoki_matchdays', JSON.stringify(updated));
                                  }}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-16 text-right font-semibold"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.videografer ?? 0)}</span>
                            </div>
                          </div>

                          {/* 7. PARKIR & BENSIN */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <Car className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Parkir & Bensin</p>
                                <p className="text-[9px] font-mono text-white/40">TRANSPORT OPERASIONAL</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Nominal</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.parkir}
                                  onChange={(e) => handleUpdateMatchdayCost(activeMatchday.id, 'parkir', Math.max(0, parseInt(e.target.value) || 0))}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-20 text-right font-semibold"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.parkir)}</span>
                            </div>
                          </div>

                          {/* 8. CUSTOM LAINNYA */}
                          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs last:pb-0">
                            {/* Left description */}
                            <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                              <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-[#bef264] shrink-0 select-none">
                                <PlusCircle className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white/95">Lainnya (Opsional)</p>
                                <p className="text-[9px] font-mono text-white/40">AD-HOC EXPENSES</p>
                              </div>
                            </div>

                            {/* Middle controls inline */}
                            <div className="flex flex-wrap items-center gap-2 flex-grow sm:justify-end">
                              {/* Custom description text field */}
                              <input
                                type="text"
                                placeholder="Keterangan ad-hoc"
                                value={activeMatchday.customExpenseDeskripsi || ''}
                                onChange={(e) => handleUpdateMatchdayCustomCost(activeMatchday.id, e.target.value, activeMatchday.customExpenseJumlah || 0)}
                                className="bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-white text-[11px] w-32 focus:outline-none focus:border-[#bef264]"
                              />

                              {/* Custom nominal input field */}
                              <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-[11px]">
                                <span className="text-[8px] font-mono text-white/40 uppercase">Nominal</span>
                                <span className="text-[10px] text-white/30 font-mono">Rp</span>
                                <input
                                  type="number"
                                  value={activeMatchday.customExpenseJumlah || ''}
                                  onChange={(e) => handleUpdateMatchdayCustomCost(activeMatchday.id, activeMatchday.customExpenseDeskripsi || '', Math.max(0, parseInt(e.target.value) || 0))}
                                  className="bg-transparent text-white font-mono text-xs focus:outline-none w-20 text-right font-semibold"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            {/* Right Subtotal Display */}
                            <div className="text-right shrink-0 min-w-[90px] flex flex-col items-end">
                              <span className="text-[9px] font-mono text-white/30 tracking-wider">SUBTOTAL</span>
                              <span className="font-mono font-bold text-white text-xs">{formatRupiah(activeMatchday.customExpenseJumlah || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detail matchday's summary financial dashboard report */}
                      <div className="bg-[#111112] border border-white/5 rounded-3xl p-5 shadow-md relative overflow-hidden">
                        <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#bef264] mb-4">Summary Keuangan Sesi</h4>
                        
                        {(() => {
                          const mFin = getMatchdayFinances(activeMatchday);
                          return (
                            <div className="space-y-4 font-sans text-xs">
                              {/* Total Pemasukan mathday */}
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">Iuran Pemain ({mFin.paidCount} Lunas):</span>
                                <span className="text-[#bef264] font-bold font-mono">{formatRupiah(mFin.totalCollection)}</span>
                              </div>

                              {/* Total Pengeluaran mathday */}
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">Total Biaya Sesi:</span>
                                <span className="text-rose-400 font-bold font-mono">{formatRupiah(mFin.totalExpenses)}</span>
                              </div>

                              {/* Net Statement */}
                              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Hasil Sesi:</span>
                                <span className={`text-base font-black font-mono ${mFin.netProfit >= 0 ? 'text-[#bef264]' : 'text-rose-400'}`}>
                                  {mFin.netProfit >= 0 ? '+' : ''}{formatRupiah(mFin.netProfit)}
                                </span>
                              </div>

                              {/* Warning advisory box */}
                              {mFin.netProfit < 0 ? (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/10 text-rose-350 text-[10px] rounded-xl leading-relaxed flex gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
                                  <span>Keuangan untuk matchday ini minus <strong>{formatRupiah(Math.abs(mFin.netProfit))}</strong>. Kekurangan perlu disubsidi menggunakan dana kas utama / sponsor tim.</span>
                                </div>
                              ) : (
                                <div className="p-3 bg-[#bef264]/10 border border-[#bef264]/10 text-[#bef264] text-[10px] rounded-xl leading-relaxed flex gap-2">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>Keuntungan surplus <strong>{formatRupiah(mFin.netProfit)}</strong>! Surplus ini akan ditambahkan ke Buku Kas Utama tim saat disinkronisasikan.</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="bg-[#111112] border border-white/5 rounded-3xl p-16 text-center text-xs text-white/30 font-sans shadow-lg">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-[#bef264]/30 animate-pulse" />
                  <p className="text-sm font-semibold text-white/50">Belum Ada Sesi Pertandingan</p>
                  <p className="text-xs text-white/30 mt-1">Gunakan tombol "Buat Sesi" untuk memicu jadwal latihan hari Minggu baru.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      ) : (
        /* MONTHLY WRAP-UP TAB SCREEN (Laporan Bulanan) */
        <div className="space-y-6">
          <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-black text-white font-sans tracking-tight">Analisis Kas Bulanan</h3>
                <p className="text-xs text-white/50 mt-1">Rincian cashflow terkonsolidasi dari seluruh aktivitas matchday setiap bulan.</p>
              </div>
              <div className="p-2 px-3 bg-white/5 border border-white/5 text-white/50 text-[10px] font-mono tracking-wider uppercase rounded-xl">
                Buku Kas Futsal
              </div>
            </div>

            {monthlyData.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/30 font-sans">
                Belum ada data matchday bulan ini untuk dikalkulasikan.
              </div>
            ) : (
              <div className="space-y-6">
                {monthlyData.map((mon) => {
                  const percentPerformance = Math.min(100, mon.expenses > 0 ? Math.round((mon.income / mon.expenses) * 100) : 0);
                  return (
                    <div key={mon.month} className="p-6 bg-black border border-white/5 rounded-2xl space-y-4">
                      
                      {/* Month basic stats row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-bold text-white font-sans">{mon.month}</h4>
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{mon.matchCount} Pertandingan Terjadwal</span>
                        </div>

                        {/* Summary outcomes */}
                        <div className="flex items-center gap-6 font-mono text-xs">
                          <div>
                            <span className="text-[9px] text-white/30 uppercase tracking-wider block">Pendapatan Dues</span>
                            <span className="text-[#bef264] font-bold">{formatRupiah(mon.income)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/30 uppercase tracking-wider block">Biaya Lapangan</span>
                            <span className="text-rose-400 font-bold">{formatRupiah(mon.expenses)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-white/30 uppercase tracking-wider block">Margin Bersih</span>
                            <span className={`font-black ${mon.net >= 0 ? 'text-[#bef264]' : 'text-rose-450 text-rose-400'}`}>
                              {mon.net >= 0 ? '+' : ''}{formatRupiah(mon.net)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual metric progress bar: Income covering Expenses Ratio */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-[10px] text-white/40">
                          <span>Rasio Swasembada (Tiket Dues / Biaya Lapangan):</span>
                          <span className={`font-mono font-bold ${percentPerformance >= 100 ? 'text-[#bef264]' : 'text-amber-400'}`}>
                            {percentPerformance}% {percentPerformance >= 100 ? '(Surplus ✨)' : '(Membutuhkan Subsidi)'}
                          </span>
                        </div>
                        <div className="w-full bg-[#111112] border border-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentPerformance >= 100 ? 'bg-[#bef264]' : 'bg-amber-400'
                            }`}
                            style={{ width: `${percentPerformance}%` }}
                          />
                        </div>
                      </div>

                      {/* Member attendance context */}
                      <div className="flex items-center gap-4 text-[10px] pt-1 text-white/50">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-white/30" />
                          <span>Rata-Rata Kehadiran Pemain: <strong>{mon.avgAttending} Pemain/Sesi</strong></span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Quick references guidelines */}
          <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 rounded-2xl shrink-0 mt-0.5">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white">Target Optimal Keuangan Matchday Isoki</h5>
                <p className="text-[11px] text-white/40 leading-relaxed font-sans max-w-xl">
                  Sewa lapangan futsal 2 jam (200k), air minum (40k), parkir (25k), dan laundry (20k) bertotal <strong>Rp 285.000</strong> per sesi futsal. Untuk mencapai break-even, Anda membutuhkan minimal 19 kotingent pemain reguler (Rp 15.000) yang hadir dan lunas.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MATCHDAY CREATION DROPDOWN / FULL COMPACT PANEL OVERLAY */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsCreating(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#18181b]">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#bef264]" />
                    Jadwalkan Matchday Baru
                  </h4>
                  <p className="text-[9px] font-mono text-white/40 mt-0.5 uppercase tracking-wider">Sunday Practice Preset Config</p>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 px-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSaveMatchday} className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                
                {/* Name Matchday & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Nama Pertandingan / Sesi</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Matchday #13"
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Lokasi Lapangan</label>
                    <input
                      type="text"
                      required
                      value={newLokasi}
                      onChange={(e) => setNewLokasi(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                {/* Match Type & Pitch Category selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tipe Pertandingan</label>
                    <select
                      value={newJenisMatch}
                      onChange={(e) => setNewJenisMatch(e.target.value as 'Latihan Internal' | 'Sparing')}
                      className="w-full px-3 py-2 bg-[#18181b] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264] cursor-pointer"
                    >
                      <option value="Latihan Internal">Latihan Internal</option>
                      <option value="Sparing">Sparing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Cabang Olahraga / Kategori</label>
                    <input
                      type="text"
                      placeholder="Contoh: Futsal, Basket, Badminton, dll."
                      value={newKategoriCabang}
                      onChange={(e) => setNewKategoriCabang(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#18181b] border border-white/5 focus:border-brand rounded-xl text-xs text-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Date & Time slots */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={newTanggal}
                      onChange={(e) => setNewTanggal(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Jam Mulai</label>
                    <input
                      type="time"
                      required
                      value={newWaktuMulai}
                      onChange={(e) => setNewWaktuMulai(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Jam Selesai</label>
                    <input
                      type="time"
                      required
                      value={newWaktuSelesai}
                      onChange={(e) => setNewWaktuSelesai(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                {/* Preset costs details */}
                <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono text-[#bef264] uppercase tracking-widest block font-bold">Standard Matchday Cost & Peran (Rp)</span>
                  
                  {/* Hours configuration */}
                  <div className="grid grid-cols-2 gap-3 text-xs pb-3 border-b border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Durasi Bermain:</label>
                      <select
                        value={newDurasiJam}
                        onChange={(e) => setNewDurasiJam(parseInt(e.target.value) || 2)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white focus:outline-none"
                      >
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Tarif Lapangan / Jam (Rp):</label>
                      <input
                        type="number"
                        required
                        value={newSewaPerJam}
                        onChange={(e) => setNewSewaPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculated total field rent & parkir */}
                  <div className="grid grid-cols-2 gap-3 text-xs pb-2">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1 font-semibold">Total Sewa Futsal:</label>
                      <input
                        type="number"
                        readOnly
                        value={newSewa}
                        className="w-full px-2 py-1.5 bg-neutral-950 border border-white/5 rounded-lg text-[#bef264] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Bensin & Parkir (Rp):</label>
                      <input
                        type="number"
                        required
                        value={newParkir}
                        onChange={(e) => setNewParkir(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Air Mineral per Dus config */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Air Mineral Qty (Dus):</label>
                      <input
                        type="number"
                        required
                        value={newQtyAirMinum}
                        onChange={(e) => setNewQtyAirMinum(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Harga per Dus (Rp):</label>
                      <input
                        type="number"
                        required
                        value={newHargaAirMinumPerDus}
                        onChange={(e) => setNewHargaAirMinumPerDus(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-white/40 pr-1">
                    Subtotal Air: <span className="text-white font-bold">{formatRupiah(newAir)}</span>
                  </div>

                  {/* Laundry per kg config */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Berat Laundry (Kg):</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={newQtyLaundryKg}
                        onChange={(e) => setNewQtyLaundryKg(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Harga Laundry / Kg (Rp):</label>
                      <input
                        type="number"
                        required
                        value={newHargaLaundryPerKg}
                        onChange={(e) => setNewHargaLaundryPerKg(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-white/40 pr-1">
                    Subtotal Laundry: <span className="text-white font-bold">{formatRupiah(newLaundry)}</span>
                  </div>

                  {/* Hourly Roles: Wasit, Photographer, Videographer */}
                  <span className="text-[9px] font-mono text-[#bef264] uppercase tracking-widest block font-bold pt-2 border-t border-white/5">Peran Ops Tambahan (per Jam)</span>
                  
                  {/* WASIT */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Sewa Wasit:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={newDurasiWasitJam}
                        onChange={(e) => setNewDurasiWasitJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Sewa Wasit/Jam</label>
                      <input
                        type="number"
                        value={newTarifWasitPerJam || ''}
                        onChange={(e) => setNewTarifWasitPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* FOTOGRAFER */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Fotografer:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={newDurasiFotograferJam}
                        onChange={(e) => setNewDurasiFotograferJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Tarif/Jam (Rp)</label>
                      <input
                        type="number"
                        value={newTarifFotograferPerJam || ''}
                        onChange={(e) => setNewTarifFotograferPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* VIDEOGRAFER */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Videografer:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={newDurasiVideograferJam}
                        onChange={(e) => setNewDurasiVideograferJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Tarif/Jam (Rp)</label>
                      <input
                        type="number"
                        value={newTarifVideograferPerJam || ''}
                        onChange={(e) => setNewTarifVideograferPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Extra custom preset */}
                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Biaya Tambahan (Ket):</label>
                      <input
                        type="text"
                        placeholder="Snack / Lainnya..."
                        value={newCustomDesc}
                        onChange={(e) => setNewCustomDesc(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Nominal tambahan (Rp):</label>
                      <input
                        type="number"
                        value={newCustomAmount || ''}
                        onChange={(e) => setNewCustomAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl flex items-start gap-2 text-[10px] text-white/40 font-mono scale-95 border border-white/5 justify-center">
                  <span className="text-[#bef264] font-bold">ℹ Note:</span>
                  <span>Anggota tim aktif akan otomatis diikutsertakan sebagai calon presensi dengan biaya standar: Player Rp 15.000 / Keeper Rp 10.000.</span>
                </div>

                {errorText && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorText}</span>
                  </div>
                )}

                {/* Submit actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#bef264] hover:bg-brand-hover text-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#bef264]/10 uppercase tracking-wider"
                  >
                    <Check className="h-4 w-4 stroke-[3px]" />
                    Simpan Pertandingan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MATCHDAY DETAIL MODAL - DEPRECATED (EDITING IS NOW IN_PLACE) */}
      <AnimatePresence>
        {false && isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsEditing(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#18181b]">
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Edit className="h-4 w-4 text-[#bef264]" />
                    Edit Detail Sesi Matchday
                  </h4>
                  <p className="text-[9px] font-mono text-white/40 mt-0.5 uppercase tracking-wider">Sesuaikan Jadwal & Biaya Sesi</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 px-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleUpdateMatchday} className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
                
                {/* Name Matchday & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Nama Sesi</label>
                    <input
                      type="text"
                      required
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Lokasi Lapangan</label>
                    <input
                      type="text"
                      required
                      value={editLokasi}
                      onChange={(e) => setEditLokasi(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                {/* Date & Time slots */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={editTanggal}
                      onChange={(e) => setEditTanggal(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Jam Mulai</label>
                    <input
                      type="time"
                      required
                      value={editWaktuMulai}
                      onChange={(e) => setEditWaktuMulai(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Jam Selesai</label>
                    <input
                      type="time"
                      required
                      value={editWaktuSelesai}
                      onChange={(e) => setEditWaktuSelesai(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#bef264]"
                    />
                  </div>
                </div>

                {/* Costs configuration details */}
                <div className="p-4 bg-black border border-white/5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono text-[#bef264] uppercase tracking-widest block font-bold">Biaya & Peran Sesi Futsal (Rp)</span>
                  
                  {/* Hours configuration */}
                  <div className="grid grid-cols-2 gap-3 text-xs pb-3 border-b border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Durasi Bermain:</label>
                      <select
                        value={editDurasiJam}
                        onChange={(e) => setEditDurasiJam(parseInt(e.target.value) || 2)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white focus:outline-none"
                      >
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Tarif Lapangan / Jam (Rp):</label>
                      <input
                        type="number"
                        required
                        value={editSewaPerJam}
                        onChange={(e) => setEditSewaPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculated total field rent & parkir */}
                  <div className="grid grid-cols-2 gap-3 text-xs pb-2">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1 font-semibold">Total Sewa Futsal:</label>
                      <input
                        type="number"
                        readOnly
                        value={editSewa}
                        className="w-full px-2 py-1.5 bg-neutral-950 border border-white/5 rounded-lg text-[#bef264] font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Bensin & Parkir (Rp):</label>
                      <input
                        type="number"
                        required
                        value={editParkir}
                        onChange={(e) => setEditParkir(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Air Mineral per Dus config */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Air Mineral Qty (Dus):</label>
                      <input
                        type="number"
                        required
                        value={editQtyAirMinum}
                        onChange={(e) => setEditQtyAirMinum(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Harga per Dus (Rp):</label>
                      <input
                        type="number"
                        required
                        value={editHargaAirMinumPerDus}
                        onChange={(e) => setEditHargaAirMinumPerDus(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-white/40 pr-1">
                    Subtotal Air: <span className="text-white font-bold">{formatRupiah(editAir)}</span>
                  </div>

                  {/* Laundry per kg config */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Berat Laundry (Kg):</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={editQtyLaundryKg}
                        onChange={(e) => setEditQtyLaundryKg(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Harga Laundry / Kg (Rp):</label>
                      <input
                        type="number"
                        required
                        value={editHargaLaundryPerKg}
                        onChange={(e) => setEditHargaLaundryPerKg(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-white/40 pr-1">
                    Subtotal Laundry: <span className="text-white font-bold">{formatRupiah(editLaundry)}</span>
                  </div>

                  {/* Hourly Roles: Wasit, Photographer, Videographer */}
                  <span className="text-[9px] font-mono text-[#bef264] uppercase tracking-widest block font-bold pt-2 border-t border-white/5">Peran Ops Tambahan (per Jam)</span>
                  
                  {/* WASIT */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Sewa Wasit:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={editDurasiWasitJam}
                        onChange={(e) => setEditDurasiWasitJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Sewa Wasit/Jam</label>
                      <input
                        type="number"
                        value={editTarifWasitPerJam || ''}
                        onChange={(e) => setEditTarifWasitPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* FOTOGRAFER */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Fotografer:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={editDurasiFotograferJam}
                        onChange={(e) => setEditDurasiFotograferJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Tarif/Jam (Rp)</label>
                      <input
                        type="number"
                        value={editTarifFotograferPerJam || ''}
                        onChange={(e) => setEditTarifFotograferPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* VIDEOGRAFER */}
                  <div className="grid grid-cols-3 gap-2 text-xs pb-1">
                    <span className="self-center font-bold text-white text-[11px]">Videografer:</span>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Durasi (Jam)</label>
                      <select
                        value={editDurasiVideograferJam}
                        onChange={(e) => setEditDurasiVideograferJam(parseInt(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-[#18181b] border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                      >
                        <option value="0">0 Jam</option>
                        <option value="1">1 Jam</option>
                        <option value="2">2 Jam</option>
                        <option value="3">3 Jam</option>
                        <option value="4">4 Jam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono text-white/30 tracking-wider uppercase mb-0.5">Tarif/Jam (Rp)</label>
                      <input
                        type="number"
                        value={editTarifVideograferPerJam || ''}
                        onChange={(e) => setEditTarifVideograferPerJam(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-1.5 py-1 bg-white/5 border border-white/5 rounded-lg text-white font-mono text-[11px] focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Extra custom preset */}
                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Biaya Tambahan (Ket):</label>
                      <input
                        type="text"
                        placeholder="Lainnya..."
                        value={editCustomDesc}
                        onChange={(e) => setEditCustomDesc(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-white/40 tracking-wider mb-1">Nominal tambahan:</label>
                      <input
                        type="number"
                        value={editCustomAmount || ''}
                        onChange={(e) => setEditCustomAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/5 rounded-lg text-white font-mono"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {editErrorText && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{editErrorText}</span>
                  </div>
                )}

                {/* Submit actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#bef264] hover:bg-brand-hover text-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#bef264]/10 uppercase tracking-wider"
                  >
                    <Check className="h-4 w-4 stroke-[3px]" />
                    Simpan Perubahan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOUBLE CONFIRMATION OVERLAY FOR DELETE MATCHDAY */}
      {matchdayToDeleteId && (() => {
        const targetMatch = matchdays.find(m => m.id === matchdayToDeleteId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setMatchdayToDeleteId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#111112] border border-white/5 rounded-3xl shadow-2xl p-6 z-10 font-sans"
            >
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Hapus Sesi Matchday?</h4>
              
              {targetMatch && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 my-3 space-y-1 text-left">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#bef264]">{targetMatch.tanggal}</span>
                  <p className="text-xs font-bold text-white truncate">{targetMatch.namaMatchday}</p>
                  <p className="text-[10px] text-white/40 truncate">{targetMatch.lokasi}</p>
                </div>
              )}
              
              <p className="text-xs text-white/50 leading-relaxed font-sans text-left">
                Apakah Anda benar-benar yakin ingin menghapus jadwal aktivitas matchday ini? Seluruh daftar absensi dan riwayat keuangan terkait sesi ini akan dihapus permanen.
              </p>

              {targetMatch && targetMatch.isSynced && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-3.5 my-3 text-left">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="revert-finance-checkbox"
                      type="checkbox"
                      checked={deleteRelatedTransactions}
                      onChange={(e) => setDeleteRelatedTransactions(e.target.checked)}
                      className="mt-1 h-3.5 w-3.5 rounded border-white/10 bg-white/5 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-rose-500"
                    />
                    <label htmlFor="revert-finance-checkbox" className="text-xs text-rose-300 font-medium leading-relaxed select-none cursor-pointer">
                      Tarik kembali catatan kas dari Buku Kas Utama
                      <span className="block text-[10px] text-white/40 mt-0.5 leading-normal">
                        Ini akan menghapus iuran & operasional terkait di Buku Kas agar laporan keuangan tetap akurat.
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  onClick={() => setMatchdayToDeleteId(null)}
                  className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={confirmDeleteMatchday}
                  className="py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-rose-500/10"
                >
                  Ya, Hapus Sesi
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

    </div>
  );
}
