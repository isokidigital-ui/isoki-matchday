import React, { useEffect, useState } from 'react';
import { LangType } from '../utils/lang';
import SuperAdminAuthScreen from './SuperAdminAuthScreen';
import SuperAdminManageAccess from './SuperAdminManageAccess';

type SuperAuthState = {
  isAuthenticated: boolean;
  username: string | null;
};

const SUPER_AUTH_KEY = 'isoki_super_auth_session';

export default function SuperAdminApp({
  lang,
  toggleLang,
}: {
  lang: LangType;
  toggleLang: () => void;
}) {
  const [auth, setAuth] = useState<SuperAuthState>({ isAuthenticated: false, username: null });

  useEffect(() => {
    const stored = localStorage.getItem(SUPER_AUTH_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.isAuthenticated && parsed?.username) {
        setAuth(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    const expired: SuperAuthState = { isAuthenticated: false, username: null };
    setAuth(expired);
    localStorage.removeItem(SUPER_AUTH_KEY);
  };

  if (!auth.isAuthenticated) {
    return (
      <SuperAdminAuthScreen
        lang={lang}
        toggleLang={toggleLang}
        onLoginSuccess={(username) => {
          const next: SuperAuthState = { isAuthenticated: true, username };
          setAuth(next);
          localStorage.setItem(SUPER_AUTH_KEY, JSON.stringify(next));
        }}
      />
    );
  }

  alert('SUPER_APP_RENDER');
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-neutral-200 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Super Admin</h2>
            <p className="text-xs text-white/40 font-mono mt-1">
              Logged in as: <span className="text-white/70 font-bold">{auth.username}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/60 hover:text-white cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div className="mb-4 text-xs font-mono text-rose-200/80">
          RENDERED_NEW_SUPER_ADMIN_ACCESS
        </div>
        <SuperAdminManageAccess lang={lang} />

      </div>
    </div>
  );
}

