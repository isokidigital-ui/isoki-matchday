import { Shield, LayoutDashboard, Users, Wallet, LogOut, Menu, X, Calendar } from 'lucide-react';
import { useState } from 'react';
import { ClubConfig } from '../types';
import { LangType, TRANSLATIONS } from '../utils/lang';

interface HeaderProps {
  currentTab: 'dashboard' | 'members' | 'finance' | 'matchday';
  setTab: (tab: 'dashboard' | 'members' | 'finance' | 'matchday') => void;
  adminName: string;
  onLogout: () => void;
  clubConfig: ClubConfig | null;
  lang: LangType;
  toggleLang: () => void;
}

export default function Header({ currentTab, setTab, adminName, onLogout, clubConfig, lang, toggleLang }: HeaderProps) {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: 'dashboard' as const, label: t.home, icon: LayoutDashboard, mobileLabel: t.home },
    { id: 'matchday' as const, label: t.matchday, icon: Calendar, mobileLabel: t.matchday },
    { id: 'members' as const, label: t.members, icon: Users, mobileLabel: t.members },
    { id: 'finance' as const, label: t.finance, icon: Wallet, mobileLabel: t.finance },
  ];

  return (
    <>
      <header id="app-header" className="sticky top-0 z-40 bg-[#111112]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand in High Contrast Elegant Style */}
            <div className="flex items-center gap-3">
              {clubConfig?.logoUrl ? (
                <img 
                  src={clubConfig.logoUrl} 
                  alt={clubConfig.name} 
                  className="w-10 h-10 object-contain image-rendering-pixel shrink-0 bg-white/5 p-1 rounded-xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex-shrink-0 w-8 h-8 bg-[#bef264] rounded-lg flex items-center justify-center shadow-md shadow-[#bef264]/10">
                  <div className="w-4 h-4 bg-black rotate-45"></div>
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-black text-white tracking-tight block leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                  {clubConfig?.name.toUpperCase() || 'ISOKI MATCH'}
                </span>
                <span className="text-[9px] font-mono text-[#bef264]/80 block mt-0.5 uppercase tracking-wider font-semibold" style={{ color: 'var(--brand-color)' }}>
                  ISOKI matchday
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/5 border font-bold'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                    style={isActive ? { color: 'var(--brand-color)', borderColor: 'rgba(255, 255, 255, 0.05)' } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* User info & Logout button on far right */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all cursor-pointer text-[10px] font-mono font-bold uppercase tracking-wider text-[#bef264]"
                style={{ color: 'var(--brand-color)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                title="Ganti Bahasa / Change Language"
              >
                <span>🌍</span>
                <span>{lang}</span>
              </button>

              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{t.loggedAs}</p>
                <p className="text-xs sm:text-sm font-semibold text-white/80">{adminName}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2.5 bg-[#18181b] hover:bg-red-950/20 border border-white/5 hover:border-red-900/20 text-white/40 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Dock for Mobile (Zero clicks navigation, pristine layout) */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111112]/95 backdrop-blur-lg border-t border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] px-4 py-3 pb-safe-bottom"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="relative flex flex-col items-center gap-1.5 focus:outline-none flex-1 py-1"
              >
                {/* Active Light Indicator Dot at the top */}
                <div 
                  className={`absolute -top-3 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--brand-color)', boxShadow: `0 0 8px var(--brand-color)` } : undefined}
                />
                
                {/* Icon with interactive scaling and coloring */}
                <div 
                  className={`p-1 rounded-lg transition-transform duration-200`}
                  style={isActive ? { transform: 'scale(1.1)', color: 'var(--brand-color)' } : { color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  <Icon className="h-[21px] w-[21px]" />
                </div>

                {/* Typography pairing for small device limits */}
                <span 
                  className={`text-[9px] font-mono tracking-widest uppercase transition-colors duration-200`}
                  style={isActive ? { color: 'var(--brand-color)', fontWeight: 650 } : { color: 'rgba(255, 255, 255, 0.3)' }}
                >
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
