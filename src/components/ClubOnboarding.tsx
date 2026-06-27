import React, { useMemo, useState } from 'react';
import { Shield, Loader, ArrowRight, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LangType, TRANSLATIONS } from '../utils/lang';
import { ClubConfig } from '../types';
import { useAuth } from '../hooks/useAuth';

type ClubOnboardingProps = {
  lang: LangType;
  toggleLang: () => void;
  // user sudah login, kita butuh username admin untuk 1) set branding dan 2) update club profile
  adminUsername: string;
  clubId: string;
  initialConfig?: ClubConfig | null;
  onDone: (clubConfig: ClubConfig) => void;
};

export default function ClubOnboarding({
  lang,
  adminUsername,
  clubId,
  initialConfig,
  onDone,
}: ClubOnboardingProps) {
  const t = TRANSLATIONS[lang];
  const authHook = useAuth();
  const { setOnboarded } = require('../hooks/useClubOnboarding').useClubOnboarding();



  // Minimal onboarding UI (simple): edit nama club + warna + logo
  const [clubName, setClubName] = useState(initialConfig?.name || '');
  const [clubAbbrev, setClubAbbrev] = useState(initialConfig?.abbreviation || '');
  const [themeColor, setThemeColor] = useState(initialConfig?.themeColor || '#bef264');
  const [themeColorHover, setThemeColorHover] = useState(initialConfig?.themeColorHover || '#a3d94b');

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(initialConfig?.logoUrl || null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedColorPreset = useMemo(() => {
    const c = themeColor;
    const h = themeColorHover;
    return { c, h };
  }, [themeColor, themeColorHover]);

  const getInitialsLogoUri = (abbrev: string, color: string): string => {
    const safeColor = color.startsWith('#') ? '%23' + color.substring(1) : color;
    const chars = (abbrev || 'FC').substring(0, 3).toUpperCase();
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="none"/>
      <path d="M15,10 L85,10 L80,75 L50,95 L20,75 Z" fill="${safeColor}" />
      <path d="M20,15 L80,15 L75,70 L50,88 L25,70 Z" fill="%23111112" />
      <text x="50" y="55" fill="${safeColor}" font-family="sans-serif" font-weight="900" font-size="20" text-anchor="middle" letter-spacing="1">${chars}</text>
      <path d="M40,68 L50,76 L60,68" fill="none" stroke="${safeColor}" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + svgContent;
  };

  const getActiveLogoPreview = () => {
    if (customLogoUrl) return customLogoUrl;
    return getInitialsLogoUri(clubAbbrev || 'FC', selectedColorPreset.c);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(lang === 'ID' ? 'Format logo salah. Upload gambar.' : 'Invalid logo file. Upload an image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomLogoUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clubName.trim()) {
      setError(lang === 'ID' ? 'Nama tim wajib diisi.' : 'Team name is required.');
      return;
    }

    const cleanAbbrev = clubAbbrev.trim().toUpperCase().replace(/[^A-Za-z0-9]/g, '');
    if (cleanAbbrev.length < 2 || cleanAbbrev.length > 6) {
      setError(lang === 'ID' ? 'Singkatan tim 2-6 karakter alfanumerik.' : 'Abbreviation must be 2-6 alphanumeric chars.');
      return;
    }

    setIsSaving(true);
    try {
      // update branding (logo/color/theme) 
      const finalLogo = customLogoUrl || getInitialsLogoUri(cleanAbbrev, themeColor);

      const updates: Partial<ClubConfig> = {
        logoUrl: finalLogo,
        themeColor,
        themeColorHover,
      };

      const profileRes = await authHook.updateClubProfile(clubId, updates);
      if (!profileRes.success) {
        throw new Error(profileRes.message);
      }

      // mark onboarded=true in DB
      // NOTE: implementasi DB: clubs.onboarded (boolean)
      // We update only onboarded flag to true.
      // set clubs.onboarded=true
      // IMPORTANT: kita patch DB langsung dengan supabase via updateClubProfile endpoint yang ada.
      // Karena hook ini belum menyediakan updateClubOnboarded, kita pakai updateClubProfile dulu.
      // (Kalau mau benar-benar add endpoint, tinggal tambah function ke useAuth.)





      // Use current config to continue
      const clubConfig: ClubConfig = {
        name: clubName.trim(),
        abbreviation: cleanAbbrev,
        logoUrl: finalLogo,
        themeColor,
        themeColorHover,
        sportsType: initialConfig?.sportsType || 'Multi Sport',
      };

      const onboardRes = await setOnboarded(clubId, true);
      if (!onboardRes.success) {
        throw new Error(onboardRes.message);
      }

      onDone(clubConfig);

    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === 'ID' ? 'Gagal menyimpan onboarding.' : 'Failed to save onboarding.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-y-auto pt-12 pb-12">
      <div className="text-center mb-6 z-10">
        <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-all duration-300" style={{ backgroundColor: '#bef264', boxShadow: `0 10px 15px -3px #bef26430` }}>
          <div className="w-5 h-5 bg-black rotate-45" />
        </div>
        <h1 className="text-2xl font-black font-sans text-white tracking-widest leading-none uppercase">
          ISOKI <span style={{ color: '#bef264' }}>MATCH</span>
        </h1>
        <p className="text-white/40 text-[10px] mt-1.5 font-mono uppercase tracking-widest font-bold">{lang === 'ID' ? 'Setup Tim' : 'Team Setup'}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-xs font-bold text-white/70 mb-5 flex items-center gap-2 font-mono uppercase tracking-widest">
            <Shield className="h-4 w-4" style={{ color: '#bef264' }} />
            {lang === 'ID' ? 'Daftarkan Tim Anda' : 'Register Your Team'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                  {lang === 'ID' ? 'Nama Tim' : 'Team Name'}
                </label>
                <input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                    {lang === 'ID' ? 'Singkatan' : 'Abbrev'}
                  </label>
                  <input
                    value={clubAbbrev}
                    onChange={(e) => setClubAbbrev(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''))}
                    className="w-full px-3 py-2 bg-[#0a0a0b] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-[#bef264]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                    {lang === 'ID' ? 'Warna Tema' : 'Theme Color'}
                  </label>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full h-10 bg-[#0a0a0b] border border-white/5 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-white/5 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5" style={{ color: '#bef264' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">
                    {lang === 'ID' ? 'Lambang Tim' : 'Team Logo'}
                  </p>
                  <p className="text-[10px] text-white/40">{lang === 'ID' ? 'Upload opsional (akan auto-inisial jika kosong).' : 'Optional upload (auto initials if empty).'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3 flex flex-col items-center justify-center bg-black/50 border border-white/10 rounded-2xl p-4 self-center relative shrink-0 aspect-square">
                  <img
                    src={getActiveLogoPreview()}
                    alt="Logo"
                    className="w-16 h-16 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="md:col-span-9">
                  <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-2">
                    {lang === 'ID' ? 'Upload Logo' : 'Upload Logo'}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-colors">
                      <Upload className="h-4 w-4" style={{ color: '#bef264' }} />
                      {lang === 'ID' ? 'Pilih File' : 'Choose file'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    {customLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomLogoUrl(null)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-bold"
                      >
                        {lang === 'ID' ? 'Reset' : 'Reset'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-red-400 bg-red-950/10 border border-red-500/10 p-3 rounded-xl">
                ⚠️ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 text-black font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-mono uppercase tracking-widest mt-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#bef264', boxShadow: `0 8px 16px #bef26415` }}
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {lang === 'ID' ? 'Menyimpan...' : 'Saving...'}
                </>
              ) : (
                <>
                  {lang === 'ID' ? 'Simpan & Masuk Dashboard' : 'Save & Enter Dashboard'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-[10px] text-white/30 font-mono leading-relaxed">
            {lang === 'ID'
              ? 'Admin Anda sudah terbatas untuk 1 tim saja (sesuai izin).'
              : 'Your admin access is restricted to 1 team only (as per permission).'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

