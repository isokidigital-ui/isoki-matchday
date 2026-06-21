import React, { useState, useRef, useEffect } from 'react';
import { Matchday } from '../types';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Activity, Trophy } from 'lucide-react';

interface HomeMatchesProps {
  matchdays: Matchday[];
  onSelectMatchday: (id: string) => void;
}

export default function HomeMatches({ matchdays, onSelectMatchday }: HomeMatchesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll indicator on manual touch scrolling
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index !== currentIndex && index < matchdays.length) {
        setCurrentIndex(index);
      }
    }
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const clientWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : matchdays.length - 1;
    scrollToCard(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = currentIndex < matchdays.length - 1 ? currentIndex + 1 : 0;
    scrollToCard(nextIndex);
  };

  // Adjust scroll if window resizes
  useEffect(() => {
    const handleResize = () => {
      scrollToCard(currentIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  if (matchdays.length === 0) {
    return (
      <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 text-center select-none">
        <Calendar className="h-8 w-8 mx-auto text-white/20 mb-2.5" />
        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#bef264] mb-1">Informasi Matchday</h4>
        <p className="text-xs text-white/40 leading-relaxed font-sans">Belum ada jadwal pertandingan aktif yang terdaftar.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111112] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background soft glow */}
      <div className="absolute top-[-20%] right-[-10%] w-56 h-56 bg-[#bef264]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls */}
      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#bef264]" />
          <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Jadwal Matchday Terkini ({matchdays.length})</h4>
        </div>
        
        {/* Navigation Arrows for desktop/click friendliness */}
        {matchdays.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="Sesi Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              title="Sesi Selanjutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 max-w-full relative z-10 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {matchdays.map((md) => {
          // Defaults if not set
          const jenis = md.jenisMatch || 'Latihan Internal';
          const kategori = md.kategoriCabang || 'Futsal';
          const totalAt = md.attendance?.length || 0;
          const attendingAt = md.attendance?.filter(a => a.hadir).length || 0;

          return (
            <div
              key={md.id}
              className="min-w-full snap-center snap-always"
            >
              <div 
                onClick={() => onSelectMatchday(md.id)}
                className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#bef264]/20 rounded-2xl p-4.5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full group"
              >
                <div>
                  {/* Category badgess row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    {/* Jenis Match badge */}
                    <span className={`text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider flex items-center gap-1 shrink-0 ${
                      jenis === 'Sparing'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      <Trophy className="h-2 w-2" />
                      {jenis}
                    </span>

                    {/* Kategori Cabang badge */}
                    <span className={`text-[8px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider shrink-0 ${
                      kategori === 'Football'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : kategori === 'Mini Soccer'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      ⚽️ {kategori}
                    </span>

                    {/* Sync Status label */}
                    {md.isSynced && (
                      <span className="text-[7px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest ml-auto shrink-0">
                        Tersinkron
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-[#bef264] transition-colors leading-snug mb-3">
                    {md.namaMatchday}
                  </h3>

                  {/* Location & Time specs */}
                  <div className="space-y-1.5 text-xs text-white/50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-white/20 shrink-0" />
                      <span className="font-sans font-medium">{md.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-white/20 shrink-0" />
                      <span className="font-mono tracking-tight text-[11px]">{md.waktuMulai} - {md.waktuSelesai} WIB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-white/20 shrink-0" />
                      <span className="truncate max-w-[280px] font-sans">{md.lokasi}</span>
                    </div>
                  </div>
                </div>

                {/* Attending stats bar */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Users className="h-3.5 w-3.5" />
                    <span>Roster Terpilih:</span>
                    <span className="font-mono font-bold text-white">{totalAt} Orang</span>
                  </div>
                  <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-white/60 font-mono font-bold">
                    Hadir: {attendingAt}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dot Indicators at the bottom */}
      {matchdays.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4 relative z-10">
          {matchdays.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => scrollToCard(dotIdx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === dotIdx ? 'w-4 bg-[#bef264]' : 'w-1.5 bg-white/15 hover:bg-white/30'
              }`}
              aria-label={`Slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
