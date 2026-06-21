import React, { useState, useEffect } from 'react';
import { X, ShieldPlus, Save, AlertCircle } from 'lucide-react';
import { Member, Position } from '../types';
import { LangType, TRANSLATIONS } from '../utils/lang';

interface ModalMemberProps {
  onClose: () => void;
  onSave: (memberData: Omit<Member, 'id'> & { id?: string }) => void;
  editMember?: Member | null;
  nextMemberCode: string; // pre-computed by parent
}

export default function ModalMember({ onClose, onSave, editMember, nextMemberCode }: ModalMemberProps) {
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [posisi, setPosisi] = useState<Position>('Player');
  const [aktif, setAktif] = useState(true);
  const [fotoProfil, setFotoProfil] = useState('');
  const [errorText, setErrorText] = useState('');

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const activeLang = ((typeof localStorage !== 'undefined' ? localStorage.getItem('isoki_lang') : 'ID') as LangType) || 'ID';
  const t = TRANSLATIONS[activeLang];

  // Hydrate preset attributes if editing
  useEffect(() => {
    if (editMember) {
      setNama(editMember.nama);
      setNoHp(editMember.noHp);
      setPosisi(editMember.posisi);
      setAktif(editMember.aktif);
      setFotoProfil(editMember.fotoProfil || '');
    } else {
      setNama('');
      setNoHp('');
      setPosisi('Player');
      setAktif(true);
      setFotoProfil('');
    }
    setErrorText('');
    setShowSaveConfirm(false);
  }, [editMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations:
    if (nama.trim().length < 2) {
      setErrorText(activeLang === 'ID' ? 'Nama wajib diisi dan minimal 2 karakter!' : 'Name is required and must be at least 2 characters!');
      return;
    }

    if (/[0-9]/.test(nama)) {
      setErrorText(activeLang === 'ID' ? 'Nama tidak boleh mengandung angka. Masukkan huruf saja!' : 'Name cannot contain numbers. Letters only!');
      return;
    }

    // No HP: Opsional - Angka saja
    if (noHp && !/^\d+$/.test(noHp)) {
      setErrorText(activeLang === 'ID' ? 'Nomor HP harus berupa angka saja!' : 'Phone number must be digits only!');
      return;
    }

    setShowSaveConfirm(true);
  };

  const executeSave = () => {
    onSave({
      id: editMember?.id,
      kodeMember: editMember?.kodeMember || nextMemberCode,
      nama: nama.trim(),
      noHp: noHp.trim(),
      posisi,
      aktif,
      fotoProfil: fotoProfil.trim() || undefined,
    });
    setShowSaveConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card content */}
      <div className="relative w-full max-w-md bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans">
        
        {/* DOUBLE CONFIRMATION OVERLAY */}
        {showSaveConfirm && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-12 h-12 bg-[#bef264]/10 border border-[#bef264]/20 text-[#bef264] rounded-full flex items-center justify-center mb-4">
              <ShieldPlus className="h-6 w-6" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              {activeLang === 'ID' ? 'Simpan Perubahan?' : 'Save Changes?'}
            </h4>
            <p className="text-xs text-white/50 mt-2 max-w-xs leading-relaxed">
              {activeLang === 'ID' ? (
                <>Apakah Anda yakin ingin {editMember ? "mengubah data" : "mendaftarkan member"} <strong className="text-[#bef264] font-semibold" style={{ color: 'var(--brand-color)' }}>{nama}</strong>?</>
              ) : (
                <>Are you sure you want to {editMember ? "modify the details for" : "enrol new member"} <strong className="text-[#bef264] font-semibold" style={{ color: 'var(--brand-color)' }}>{nama}</strong>?</>
              )}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                {activeLang === 'ID' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeSave}
                className="py-2.5 px-5 bg-[#bef264] hover:bg-[#bef264]/90 text-black text-xs font-extrabold rounded-xl cursor-pointer transition-colors shadow-lg shadow-[#bef264]/20"
                style={{ backgroundColor: 'var(--brand-color)' }}
              >
                {activeLang === 'ID' ? 'Ya, Simpan' : 'Yes, Save'}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#18181b]">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldPlus className="h-4 w-4 text-[#bef264]" style={{ color: 'var(--brand-color)' }} />
            {editMember 
              ? (activeLang === 'ID' ? `Edit Member: ${editMember.kodeMember}` : `Edit Member: ${editMember.kodeMember}`) 
              : (activeLang === 'ID' ? 'Registrasi Member Baru' : 'Register New Member')}
          </h4>
          <button onClick={onClose} className="p-1 px-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Kode Member (Readonly, Auto Generated) */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
              {activeLang === 'ID' ? 'Kode Member (Otomatis)' : 'Member Code (Auto Generated)'}
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={editMember ? editMember.kodeMember : nextMemberCode}
              className="w-full px-3 py-2.5 bg-black border border-white/5 rounded-xl text-[#bef264] text-xs font-mono font-bold select-all focus:outline-none cursor-not-allowed opacity-80"
              style={{ color: 'var(--brand-color)' }}
            />
          </div>

          {/* Nama (Wajib, minimal 2 karakter) */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
              {activeLang === 'ID' ? 'Nama Lengkap' : 'Full Name'} <span className="text-[#bef264]" style={{ color: 'var(--brand-color)' }}>*</span>
            </label>
            <input
              type="text"
              required
              placeholder={activeLang === 'ID' ? 'Contoh: Yanuar, Rian, Hamzah' : 'e.g. Yanuar, Rian, Hamzah'}
              value={nama}
              onChange={(e) => setNama(e.target.value.replace(/[0-9]/g, ''))}
              className="w-full px-3 py-2.5 bg-black border border-white/5 rounded-xl text-slate-200 text-xs font-sans focus:outline-none focus:border-[#bef264] placeholder-white/20 transition-colors"
            />
          </div>

          {/* No HP (Opsional, angka saja) */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
              {activeLang === 'ID' ? 'Nomor HP (WhatsApp)' : 'Phone Number (WhatsApp)'} <span className="text-white/20">({activeLang === 'ID' ? 'Opsional' : 'Optional'})</span>
            </label>
            <input
              type="text"
              placeholder={activeLang === 'ID' ? 'Contoh: 082119526380 (Angka saja)' : 'e.g. 082119526380'}
              value={noHp}
              onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 bg-black border border-white/5 rounded-xl text-[#bef264] text-xs font-mono focus:outline-none focus:border-[#bef264] placeholder-white/20 transition-colors"
              style={{ color: 'var(--brand-color)' }}
            />
          </div>

          {/* Posisi (Required selector) */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              {activeLang === 'ID' ? 'Posisi Bermain' : 'Playing Position'} <span className="text-[#bef264]" style={{ color: 'var(--brand-color)' }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPosisi('Player')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  posisi === 'Player'
                    ? 'bg-[#bef264]/10 text-[#bef264] border-[#bef264]/20 shadow-inner'
                    : 'bg-black border-white/5 text-white/30 hover:text-white/60'
                }`}
                style={posisi === 'Player' ? { color: 'var(--brand-color)', borderColor: 'var(--brand-color)' } : undefined}
              >
                {activeLang === 'ID' ? 'Pemain' : 'Player'}
              </button>
              
              <button
                type="button"
                onClick={() => setPosisi('Keeper')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  posisi === 'Keeper'
                    ? 'bg-purple-950/20 text-purple-400 border-purple-500/20 shadow-inner'
                    : 'bg-black border-white/5 text-white/30 hover:text-white/60'
                }`}
              >
                {activeLang === 'ID' ? 'Kiper' : 'Keeper (GK)'}
              </button>
            </div>
          </div>

          {/* Foto Profil (Upload / base64) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest block select-none">
              {activeLang === 'ID' ? 'Foto Profil Anggota' : 'Roster Profile Photo'} <span className="text-white/20">({activeLang === 'ID' ? 'Opsional' : 'Optional'})</span>
            </label>
            <div className="flex items-center gap-3 bg-black/45 p-3 border border-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {fotoProfil ? (
                  <img src={fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] uppercase font-mono font-bold text-white/40">
                    {nama ? nama.substring(0, 2).toUpperCase() : 'RT'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFotoProfil(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="member-photo-input"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('member-photo-input')?.click()}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  {fotoProfil 
                    ? (activeLang === 'ID' ? 'Ganti Foto Roster' : 'Change Photo') 
                    : (activeLang === 'ID' ? 'Pilih Foto Roster' : 'Choose Photo')}
                </button>
                {fotoProfil && (
                  <button
                    type="button"
                    onClick={() => setFotoProfil('')}
                    className="ml-2 px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[9px] font-mono rounded cursor-pointer transition-colors"
                  >
                    {activeLang === 'ID' ? 'Hapus' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
            <p className="text-[8px] text-white/30 font-sans leading-none mt-1">
              {activeLang === 'ID' ? 'Unggah foto berkualitas persegi (.png atau .jpg) maksimal 2MB.' : 'Upload a square profile photo (.png or .jpg) maximum 2MB.'}
            </p>
          </div>

          {/* Status Aktif Selector (Only visible during edit metadata) */}
          {editMember && (
            <div className="pt-2">
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                {activeLang === 'ID' ? 'Status Anggota' : 'Player Status'}
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-white/60 cursor-pointer">
                  <input
                    type="radio"
                    name="aktif"
                    checked={aktif === true}
                    onChange={() => setAktif(true)}
                    className="accent-[#bef264] bg-[#0a0a0b] border-white/5"
                    style={{ accentColor: 'var(--brand-color)' }}
                  />
                  {activeLang === 'ID' ? 'Aktif' : 'Active'}
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-white/60 cursor-pointer">
                  <input
                    type="radio"
                    name="aktif"
                    checked={aktif === false}
                    onChange={() => setAktif(false)}
                    className="accent-white bg-[#0a0a0b] border-white/5"
                  />
                  {activeLang === 'ID' ? 'Tidak Aktif' : 'Inactive'}
                </label>
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
            >
              {activeLang === 'ID' ? 'Kembali' : 'Back'}
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#bef264] hover:bg-brand-hover text-black text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#bef264]/10 uppercase tracking-wider"
              style={{ backgroundColor: 'var(--brand-color)' }}
            >
              <Save className="h-4 w-4 stroke-[2.5px]" />
              {activeLang === 'ID' ? 'Simpan Data' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
