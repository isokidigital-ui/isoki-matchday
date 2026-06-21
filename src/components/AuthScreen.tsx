import React, { useState, useRef } from 'react';
import { Shield, Key, User, ArrowRight, Eye, EyeOff, Upload, Image as ImageIcon, Award, Sparkles, Database, Palette, Globe, Loader, Ticket } from 'lucide-react';
import { motion } from 'motion/react';
import { ClubConfig } from '../types';
import { LangType, TRANSLATIONS } from '../utils/lang';
import { useAuth } from '../hooks/useAuth';
import { useInvitationCodes } from '../hooks/useInvitationCodes';

interface AuthScreenProps {
  onLogin: (username: string, clubConfig?: ClubConfig) => void;
  lang: LangType;
  toggleLang: () => void;
}

// Sporty Theme Color Presets (Clean & Sporty)
export const SPORTY_THEMES = [
  { name: 'Neon Lime', color: '#bef264', hover: '#a3d94b' },
  { name: 'Electric Blue', color: '#3b82f6', hover: '#2563eb' },
  { name: 'Fierce Crimson', color: '#ef4444', hover: '#dc2626' },
  { name: 'Tennis Yellow', color: '#eab308', hover: '#ca8a04' },
  { name: 'Emerald Turf', color: '#10b981', hover: '#059669' },
  { name: 'Orange Court', color: '#f97316', hover: '#ea580c' },
  { name: 'Clean Slate', color: '#64748b', hover: '#475569' },
];

export const getInitialsLogoUri = (abbrev: string, color: string): string => {
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

export default function AuthScreen({ onLogin, lang, toggleLang }: AuthScreenProps) {
  const t = TRANSLATIONS[lang];
  const authHook = useAuth();
  const invitationHook = useInvitationCodes();
  const [activeTab, setActiveTabOriginal] = useState<'login' | 'register'>('login');
  
  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register / Onboarding States
  const [regUsername, setRegUsername] = useState('admin');
  const [regPassword, setRegPassword] = useState('admin123');
  const [invitationCode, setInvitationCode] = useState('');
  const [clubName, setClubName] = useState('');
  const [clubAbbrev, setClubAbbrev] = useState('');

  // Sporty Theme Color state (Default styled Neon Lime)
  const selectedColor = '#bef264';
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [errorRegister, setErrorRegister] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle standard login with Supabase
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    setIsLoggingIn(true);

    try {
      // Try Supabase auth first
      const result = await authHook.loginClub(username, password);
      
      if (result.success && result.clubConfig) {
        // Login via Supabase succeeded
        onLogin(username, result.clubConfig);
      } else if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
        // Fallback to demo login for local testing
        const stored = localStorage.getItem('isoki_club_config');
        let config: ClubConfig | undefined;
        if (stored) {
          try {
            config = JSON.parse(stored);
          } catch (err) {}
        }
        onLogin(username, config);
      } else {
        setErrorLogin(result.message || (lang === 'ID' ? 'Username atau password salah!' : 'Incorrect username or password!'));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setErrorLogin(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Instant login with default seed club branding
  const handleInstantLogin = () => {
    const defaultClub: ClubConfig = {
      name: 'Garuda Bandung MFC',
      abbreviation: 'GBMFC',
      logoUrl: getInitialsLogoUri('GBMFC', '#bef264'),
      themeColor: '#bef264',
      themeColorHover: '#a3d94b',
      sportsType: 'Futsal'
    };
    onLogin('Admin Isoki', defaultClub);
  };

  // File Upload Handlers (FileReader base64 support)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorRegister(lang === 'ID' ? 'Format file salah! Hanya gambar (.png, .jpg, .jpeg) yang didukung.' : 'Incorrect file format! Only images (.png, .jpg, .jpeg) are supported.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogoUrl(reader.result as string);
        setErrorRegister('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorRegister(lang === 'ID' ? 'Hanya mendukung file gambar.' : 'Only image files are supported.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogoUrl(reader.result as string);
        setErrorRegister('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom club registration form submission with Supabase
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRegister('');
    setIsRegistering(true);

    try {
      // 1. Validate invitation code
      if (!invitationCode.trim()) {
        setErrorRegister(lang === 'ID' ? 'Kode undangan wajib diisi!' : 'Invitation code is required!');
        setIsRegistering(false);
        return;
      }

      const codeValidation = await invitationHook.validateCode(invitationCode.trim());
      if (!codeValidation.success) {
        setErrorRegister(codeValidation.message);
        setIsRegistering(false);
        return;
      }

      if (!clubName.trim()) {
        setErrorRegister(lang === 'ID' ? 'Nama Klub wajib diisi!' : 'Club Name is required!');
        setIsRegistering(false);
        return;
      }
      if (!clubAbbrev.trim()) {
        setErrorRegister(lang === 'ID' ? 'Singkatan nama klub wajib diisi!' : 'Club Initials/Abbr is required!');
        setIsRegistering(false);
        return;
      }

      const cleanAbbrev = clubAbbrev.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanAbbrev.length < 2 || cleanAbbrev.length > 6) {
        setErrorRegister(lang === 'ID' ? 'Singkatan Club harus berupa 2-6 karakter alfanumerik!' : 'Club initials must be between 2 and 6 alphanumeric characters!');
        setIsRegistering(false);
        return;
      }

      // Find the colors in themes list
      const matchedTheme = SPORTY_THEMES.find(t => t.color === selectedColor) || SPORTY_THEMES[0];
      const finalLogo = customLogoUrl || getInitialsLogoUri(cleanAbbrev, matchedTheme.color);

      // Register club in Supabase
      const result = await authHook.registerClub(
        clubName.trim(),
        cleanAbbrev,
        regUsername,
        regPassword
      );

      if (result.success) {
        // 2. Mark code as used after successful registration
        await invitationHook.markCodeAsUsed(invitationCode.trim());

        const clubConfig: ClubConfig = {
          name: clubName.trim(),
          abbreviation: cleanAbbrev,
          logoUrl: finalLogo,
          themeColor: matchedTheme.color,
          themeColorHover: matchedTheme.hover,
          sportsType: 'Multi Sport'
        };
        onLogin(regUsername, clubConfig);
      } else {
        setErrorRegister(result.message || (lang === 'ID' ? 'Pendaftaran gagal!' : 'Registration failed!'));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setErrorRegister(message);
    } finally {
      setIsRegistering(false);
    }
  };

  // Get active logo URL for interactive preview
  const getActiveLogoPreview = () => {
    if (customLogoUrl) return customLogoUrl;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" fill="none"/>
      <path d="M15,10 L85,10 L80,75 L50,95 L20,75 Z" fill="%23111112" stroke="%23bef264" stroke-width="4"/>
      <text x="50" y="58" fill="%23ffffff" fill-opacity="0.3" font-family="sans-serif" font-weight="900" font-size="28" text-anchor="middle">?</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + svgContent;
  };

  return (
    <div id="auth-container" className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-y-auto pt-12 pb-12">
      {/* Top Language Toggle on Authpage */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/60 backdrop-blur hover:bg-neutral-800 text-white border border-white/10 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
          title="Ganti Bahasa / Switch Language"
        >
          <span>🌍</span>
          <span>{lang}</span>
        </button>
      </div>

      {/* Decorative subtle ambient dynamic glow */}
      <div 
        className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[140px] pointer-events-none transition-all duration-700" 
        style={{ backgroundColor: `${selectedColor}0B` }}
      />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Brand Title Block */}
      <div className="text-center mb-6 z-10">
        <div 
          className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-all duration-300"
          style={{ backgroundColor: selectedColor, boxShadow: `0 10px 15px -3px ${selectedColor}30` }}
        >
          <div className="w-5 h-5 bg-black rotate-45"></div>
        </div>
        <h1 className="text-2xl font-black font-sans text-white tracking-widest leading-none uppercase">
          ISOKI <span style={{ color: selectedColor }}>MATCH</span>
        </h1>
        <p className="text-white/40 text-[10px] mt-1.5 font-mono uppercase tracking-widest font-bold">{t.portalTitle}</p>
      </div>

      {/* Main Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-[#111112] border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Registration Tab Selection */}
        <div className="flex border-b border-white/5 bg-[#18181b]/70 p-1.5 gap-1">
          <button
            onClick={() => setActiveTabOriginal('login')}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold font-mono uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'text-black shadow-md'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            }`}
            style={activeTab === 'login' ? { backgroundColor: selectedColor } : undefined}
          >
            {t.loginTab}
          </button>
          <button
            onClick={() => {
              setActiveTabOriginal('register');
              setErrorRegister('');
            }}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold font-mono uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'text-black shadow-md'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            }`}
            style={activeTab === 'register' ? { backgroundColor: selectedColor } : undefined}
          >
            {t.registerTab}
          </button>
        </div>

        {/* Tab 1: LOGIN BOX */}
        {activeTab === 'login' && (
          <div className="p-6 sm:p-8">
            <h2 className="text-xs font-bold text-white/70 mb-5 flex items-center gap-2 font-mono uppercase tracking-widest">
              <Shield className="h-4 w-4" style={{ color: selectedColor }} />
              {t.adminLoginHeader}
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">{t.usernameLabel}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-neutral-200 placeholder-white/20 focus:outline-none focus:border-brand transition-colors text-xs font-sans text-brand-input"
                    style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="e.g. admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-neutral-200 placeholder-white/20 focus:outline-none focus:border-brand transition-colors text-xs font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {errorLogin && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-red-400 bg-red-950/10 border border-red-500/10 p-3 rounded-xl leading-relaxed font-sans"
                >
                  ⚠️ {errorLogin}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 text-black font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-mono uppercase tracking-widest mt-6 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedColor, boxShadow: `0 4px 12px ${selectedColor}15` }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {lang === 'ID' ? 'Memproses...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    {t.loginBtn}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/40 mb-3 font-sans leading-relaxed">
                Mode Demo / Sandbox Instant Tanpa Setup:
              </p>
              <button
                onClick={handleInstantLogin}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 hover:border-white/15 text-white/80 font-mono text-[10px] uppercase tracking-widest border border-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {t.instantDemoBtn}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: REGISTER BOX */}
        {activeTab === 'register' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-3">
              <Sparkles className="h-5 w-5 shrink-0 mt-0.5" style={{ color: selectedColor }} />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{t.registerOnboardHeader}</h4>
                <p className="text-[11px] text-white/50 mt-1 font-sans leading-relaxed">
                  {t.registerDescr}
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Box credentials info */}
              <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 leading-none">
                  {lang === 'ID' ? '🛡️ Kredensial Login Admin' : '🛡️ Default Admin Credentials'}
                </span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1.5">{t.usernameLabel}</label>
                    <input
                      type="text"
                      disabled
                      value={regUsername}
                      className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-white/40 text-xs font-mono select-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1.5">{t.passwordLabel}</label>
                    <input
                      type="text"
                      disabled
                      value={regPassword}
                      className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-white/40 text-xs font-mono select-none"
                    />
                  </div>
                </div>
              </div>

              {/* Invitation Code Input */}
              <div>
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                  <Ticket className="inline h-3.5 w-3.5 mr-1.5" style={{ color: selectedColor }} />
                  {lang === 'ID' ? 'Kode Undangan' : 'Invitation Code'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ID' ? 'Contoh: ISK-XXXXX-XXXXX' : 'e.g. ISK-XXXXX-XXXXX'}
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0b] border border-white/5 focus:border-brand rounded-xl text-xs text-white font-mono focus:outline-none transition-colors"
                  style={{ borderColor: `${selectedColor}30` }}
                />
                <p className="text-[8px] text-white/30 mt-1.5 font-sans">
                  {lang === 'ID' 
                    ? 'Hubungi admin Isoki untuk mendapatkan kode undangan.' 
                    : 'Contact Isoki admin to get an invitation code.'}
                </p>
              </div>

              {/* Club Identity Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">{t.clubNameLabel} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'ID' ? 'Contoh: Siliwangi FC' : 'e.g. Siliwangi FC'}
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0b] border border-white/5 focus:border-brand rounded-xl text-xs text-white focus:outline-none transition-colors"
                    style={{ borderColor: `${selectedColor}30` }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">{t.clubAbbrevLabel} <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder={lang === 'ID' ? 'Contoh: SDFC' : 'e.g. SDFC'}
                    value={clubAbbrev}
                    onChange={(e) => setClubAbbrev(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-[#0a0a0b] border border-white/5 focus:border-brand rounded-xl text-xs font-mono text-white focus:outline-none transition-colors"
                    style={{ borderColor: `${selectedColor}30` }}
                  />
                </div>
              </div>



              {/* FILE UPLOAD & LOGO SECTION */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest select-none">
                  {lang === 'ID' ? 'Logo Resmi Tim' : 'Official Team Logo'}
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* PREVIEW CONTAINER */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center bg-black/50 border border-white/10 rounded-2xl p-4 self-center relative shrink-0 aspect-square">
                    <img 
                      src={getActiveLogoPreview()} 
                      alt="Logo Tim" 
                      className="w-16 h-16 object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* FILE UPLOAD AREA */}
                  <div className="md:col-span-9 space-y-2">
                    {customLogoUrl ? (
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" style={{ color: selectedColor }} />
                          <div>
                            <p className="text-[10px] font-bold text-white font-sans truncate leading-none mb-1">{t.activeCrestAlert}</p>
                            <p className="text-[8px] text-white/40 leading-none">
                              {lang === 'ID' ? 'Logo kustom siap dipasangkan pada seluruh bagian dashboard.' : 'Custom logo ready to be deployed.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomLogoUrl(null)}
                          className="text-[8px] font-mono text-rose-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-rose-500/10 transition-colors"
                        >
                          Reset Logo
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[9px] text-white/40 font-sans leading-relaxed">
                        {lang === 'ID' 
                          ? 'Silakan unggah logo resmi tim Anda (.png atau .jpg). Jika dikosongkan, sistem Isoki akan otomatis membuat logo inisial minimalis.' 
                          : 'Please upload your official team logo (.png or .jpg). If left empty, Isoki will auto-create a clean initial crest fallback.'}
                      </div>
                    )}

                    {/* File Drop zone */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                        dragActive 
                          ? 'bg-white/5 text-white' 
                          : 'border-white/5 hover:border-white/20 bg-black/30 hover:bg-black/55 text-white/40'
                      }`}
                      style={dragActive ? { borderColor: selectedColor, backgroundColor: `${selectedColor}0B` } : undefined}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleLogoUpload}
                      />
                      <Upload className="h-4 w-4 mx-auto mb-1.5" style={{ color: selectedColor }} />
                      <p className="text-[9px] font-sans font-semibold">
                        {lang === 'ID' ? 'Tarik file logo tim Anda di sini, atau' : 'Drag team logo here, or'} <span style={{ color: selectedColor }} className="hover:underline">{lang === 'ID' ? 'Pilih File' : 'Browse Files'}</span>
                      </p>
                      <p className="text-[8px] font-mono text-white/25 mt-0.5 uppercase tracking-wide">{t.dragDropSub}</p>
                    </div>
                  </div>
                </div>
              </div>

              {errorRegister && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-red-400 bg-red-950/10 border border-red-500/10 p-3 rounded-xl leading-relaxed font-sans"
                >
                  ⚠️ {errorRegister}
                </motion.div>
              )}

              {/* Submit action button */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-4 text-black font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-mono uppercase tracking-widest mt-6 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedColor, boxShadow: `0 8px 16px ${selectedColor}15` }}
              >
                {isRegistering ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {lang === 'ID' ? 'Mendaftarkan...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    {t.registerSubmitBtn}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-[10px] text-white/30 font-mono z-10 tracking-widest uppercase">
        Protected under ISOKI Matchday copyright • Sesi Aman & Terenskripsi
      </div>
    </div>
  );
}
