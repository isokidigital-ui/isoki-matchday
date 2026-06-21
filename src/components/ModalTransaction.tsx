import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, AlertCircle } from 'lucide-react';
import { Transaction, Member, TransactionType } from '../types';
import { FINANCIAL_CATEGORIES } from '../data';
import { formatRupiah } from './StatsGrid';

interface ModalTransactionProps {
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id'>) => void;
  members: Member[];
}

export default function ModalTransaction({ onClose, onSave, members }: ModalTransactionProps) {
  const [tanggal, setTanggal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [tipe, setTipe] = useState<TransactionType>('Pemasukan');
  const [kategori, setKategori] = useState('');
  const [kodeMember, setKodeMember] = useState('');
  const [errorText, setErrorText] = useState('');

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTanggal(today);
    setDeskripsi('');
    setJumlah(0);
    setTipe('Pemasukan');
    setKategori(FINANCIAL_CATEGORIES.Pemasukan[0]);
    setKodeMember('');
    setErrorText('');
    setShowSaveConfirm(false);
  }, []);

  // Update default category when type flips
  const handleTypeChange = (newType: TransactionType) => {
    setTipe(newType);
    setKategori(FINANCIAL_CATEGORIES[newType][0]);
    // clear selected member if expense, since expense usually doesn't refer to member fee dues
    if (newType === 'Pengeluaran') {
      setKodeMember('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations:
    if (!tanggal) {
      setErrorText('Pilih tanggal transaksi terlebih dahulu!');
      return;
    }

    if (deskripsi.trim().length < 3) {
      setErrorText('Deskripsi transaksi harus minimal 3 karakter!');
      return;
    }

    if (jumlah <= 0) {
      setErrorText('Jumlah uang kas harus lebih besar dari Rp 0!');
      return;
    }

    if (!kategori) {
      setErrorText('Pilih kategori keuangan!');
      return;
    }

    setShowSaveConfirm(true);
  };

  const executeSave = () => {
    onSave({
      tanggal,
      deskripsi: deskripsi.trim(),
      jumlah,
      tipe,
      kategori,
      kodeMember: kodeMember || undefined,
    });
    setShowSaveConfirm(false);
  };

  // Only show active members for selection to prevent errors
  const activeMembers = members.filter((m) => m.aktif);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal core card */}
      <div className="relative w-full max-w-md bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans">
        
        {/* DOUBLE CONFIRMATION OVERLAY */}
        {showSaveConfirm && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in font-sans">
            <div className={`w-12 h-12 ${tipe === 'Pemasukan' ? 'bg-[#bef264]/10 text-[#bef264] border-[#bef264]/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} border rounded-full flex items-center justify-center mb-4`}>
              <DollarSign className="h-6 w-6" />
            </div>
            <h4 className="text-base font-extrabold text-white">Simpan Kas Baru?</h4>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 my-3 w-full space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/30">{tipe} - {kategori}</span>
              <p className="text-xs font-bold text-white font-sans">{deskripsi}</p>
              <p className={`text-lg font-black font-mono mt-1 ${tipe === 'Pemasukan' ? 'text-[#bef264]' : 'text-rose-400'}`}>
                {tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(jumlah)}
              </p>
            </div>
            <p className="text-[11px] text-white/40 max-w-xs leading-relaxed">
              Apakah nominal dan keterangan di atas sudah benar? Aksi pencatatan kas baru ini tidak dapat diurungkan sembarangan.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="py-2.5 px-5 bg-[#bef264] hover:bg-[#bef264]/90 text-black text-xs font-extrabold rounded-xl cursor-pointer transition-colors shadow-lg shadow-[#bef264]/20"
              >
                Ya, Catat Kas
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#18181b]">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#bef264]" />
            Catat Keuangan Kas Tim
          </h4>
          <button onClick={onClose} className="p-1 px-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipe Transaksi: Pemasukan / Pengeluaran */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Tipe Alur Keuangan Kas</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('Pemasukan')}
                className={`py-2.5 px-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  tipe === 'Pemasukan'
                    ? 'bg-[#bef264]/10 text-[#bef264] border-[#bef264]/20 shadow-inner'
                    : 'bg-black border-white/5 text-white/30 hover:text-white/60'
                }`}
              >
                📥 Uang Masuk (Kas Masuk)
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('Pengeluaran')}
                className={`py-2.5 px-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  tipe === 'Pengeluaran'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-505/20 shadow-inner'
                    : 'bg-black border-white/5 text-white/30 hover:text-white/60'
                }`}
              >
                📤 Uang Keluar (Kas Keluar)
              </button>
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Tanggal Transaksi</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-white/5 rounded-xl text-neutral-200 text-xs font-mono focus:outline-none focus:border-[#bef264]"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Deskripsi Transaksi <span className="text-[#bef264]">*</span></label>
            <input
              type="text"
              required
              placeholder="Contoh: Sewa Lapangan Futsal 2 Jam, Iuran Yayan"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-white/5 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-[#bef264] placeholder-white/20 transition-colors"
              maxLength={120}
            />
          </div>

          {/* Jumlah Kas (Rp) + realtime Rupiah formatted preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest">Jumlah Uang (Rupiah) <span className="text-[#bef264]">*</span></label>
              <span className="text-[10px] font-mono text-[#bef264] font-black">{formatRupiah(jumlah)}</span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-mono text-white/30 font-bold">
                Rp
              </span>
              <input
                type="number"
                required
                min={1}
                placeholder="0"
                value={jumlah || ''}
                onChange={(e) => setJumlah(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-3.5 py-2.5 bg-black border border-white/5 rounded-xl text-neutral-200 text-xs font-mono focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          {/* Kategori Selector (dynamic dependent on Tipe) */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Kategori Transaksi</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-white/5 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-[#bef264] cursor-pointer inline-block"
            >
              {FINANCIAL_CATEGORIES[tipe].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Kode Member (Optional dropdown, only shown if Pemasukan) */}
          {tipe === 'Pemasukan' && (
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Kaitkan ke Member <span className="text-white/20">(Optional)</span></label>
              <select
                value={kodeMember}
                onChange={(e) => {
                  setKodeMember(e.target.value);
                  // Autofill description helper if linking dues
                  if (e.target.value && !deskripsi) {
                    const matched = activeMembers.find(m => m.kodeMember === e.target.value);
                    if (matched) {
                      setDeskripsi(`Iuran Bulanan - ${matched.nama}`);
                      setJumlah(50000); // Standard dues Rp 50,000
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-black border border-white/5 rounded-xl text-xs text-white/50 focus:outline-none focus:text-neutral-200 focus:border-[#bef264] cursor-pointer inline-block"
              >
                <option value="">-- Tidak Dikaitkan (Umum / Sponsor) --</option>
                {activeMembers.map((m) => (
                  <option key={m.id} value={m.kodeMember}>
                    {m.kodeMember} - {m.nama} ({m.posisi})
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-white/20 font-sans mt-1.5 lowercase">Mengaitkan iuran akan mempermudah tracking tagihan bulanan tim.</p>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Footer Submit layout */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#bef264] hover:bg-brand-hover text-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#bef264]/10 uppercase tracking-wider"
            >
              <Save className="h-4 w-4 stroke-[2.5px]" />
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
