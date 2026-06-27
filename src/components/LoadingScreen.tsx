import React from 'react';
import { Loader } from 'lucide-react';
import { LangType, TRANSLATIONS } from '../utils/lang';

type LoadingScreenProps = {
  lang: LangType;
  message?: string;
};

export default function LoadingScreen({ lang, message }: LoadingScreenProps) {
  const t = TRANSLATIONS[lang];
  const text = message ?? (lang === 'ID' ? 'Memuat...' : 'Loading...');


  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <div className="flex items-center gap-3 px-5 py-4 bg-[#111112] border border-white/5 rounded-2xl">
        <Loader className="h-5 w-5 animate-spin text-[#bef264]" />
        <span className="text-xs text-white/50 font-mono">{text}</span>
      </div>
    </div>
  );
}

