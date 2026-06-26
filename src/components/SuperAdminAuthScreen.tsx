import React, { useState } from 'react';
import { Shield, Key, ArrowRight, Eye, EyeOff, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import { useSuperAuth } from '../hooks/useSuperAuth';

interface SuperAdminAuthScreenProps {
  onLoginSuccess: (username: string) => void;
  lang: 'ID' | 'EN';
  toggleLang: () => void;
}

export default function SuperAdminAuthScreen({
  onLoginSuccess,
  lang,
  toggleLang,
}: SuperAdminAuthScreenProps) {
  const isID = lang === 'ID';
  const superAuthHook = useSuperAuth();

  const [activeTab] = useState<'login'>('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorLogin, setErrorLogin] = useState('');

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    setIsLoggingIn(true);

    try {
      const result = await superAuthHook.loginSuperAdmin(username.trim(), password);
      if (!result.success) {
        setErrorLogin(result.message);
        return;
      }
      onLoginSuccess(username.trim());
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      id="super-auth-container"
      className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 relative overflow-y-auto pt-12 pb-12"
    >
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/60 backdrop-blur hover:bg-neutral-800 text-white border border-white/10 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
          title={isID ? 'Ganti Bahasa / Switch Language' : 'Switch language'}
        >
          <span>🌍</span>
          <span>{lang}</span>
        </button>
      </div>

      <div className="text-center mb-6 z-10">
        <div
          className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-all duration-300"
          style={{ backgroundColor: '#bef264', boxShadow: `0 10px 15px -3px #bef26430` }}
        >
          <div className="w-5 h-5 bg-black rotate-45" />
        </div>
        <h1 className="text-2xl font-black font-sans text-white tracking-widest leading-none uppercase">
          ISOKI <span style={{ color: '#bef264' }}>SUPER</span>
        </h1>
        <p className="text-white/40 text-[10px] mt-1.5 font-mono uppercase tracking-widest font-bold">
          {isID ? 'Portal Admin Utama' : 'Main Admin Portal'}
        </p>
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
            {isID ? 'Masuk Sebagai Super Admin' : 'Login as Super Admin'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                {isID ? 'Username Super Admin' : 'Super Admin Username'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                  <Shield className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder={isID ? 'contoh: isoki.super' : 'e.g. isoki.super'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-neutral-200 placeholder-white/20 focus:outline-none focus:border-brand transition-colors text-xs font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5">
                {isID ? 'Password Super Admin' : 'Super Admin Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={isID ? 'Masukkan password...' : 'Enter password...'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0a0a0b] border border-white/5 rounded-xl text-neutral-200 placeholder-white/20 focus:outline-none focus:border-brand transition-colors text-xs font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
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
              disabled={isLoggingIn || superAuthHook.isLoading}
              className="w-full py-3.5 text-black font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-mono uppercase tracking-widest mt-6 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#bef264', boxShadow: `0 4px 12px #bef26415` }}
            >
              {isLoggingIn || superAuthHook.isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {isID ? 'Memproses...' : 'Processing...'}
                </>
              ) : (
                <>
                  {isID ? 'Masuk' : 'Login'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

