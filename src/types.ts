export type Position = 'Player' | 'Keeper';

export interface ClubConfig {
  name: string;
  abbreviation: string;
  logoUrl?: string; // base64 string
  themeColor?: string; // primary color hex
  themeColorHover?: string; // secondary hover color hex
  sportsType?: string; // Optional custom sport category if defined
}

export interface Member {
  id: string;
  kodeMember: string;
  nama: string;
  noHp: string;
  posisi: Position;
  aktif: boolean;
  fotoProfil?: string;
}

export type TransactionType = 'Pemasukan' | 'Pengeluaran';

export interface Transaction {
  id: string;
  tanggal: string;
  deskripsi: string;
  jumlah: number;
  tipe: TransactionType;
  kategori: string;
  kodeMember?: string; // Optional reference to a member's dues
}

export interface AuthState {
  isAuthenticated: boolean;
  adminUsername: string | null;
}

export interface MatchdayAttendance {
  memberId: string;
  kodeMember: string;
  nama: string;
  posisi: Position;
  hadir: boolean;
  bayar: boolean;
  jumlahBayar: number; // e.g. Player default 15000, Keeper 10000
}

export interface Matchday {
  id: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  namaMatchday: string;
  lokasi: string;
  sewaLapangan: number; // default rate or calculated rate if durasi and rate per hour are present
  airMinum: number; // default 40000
  qtyAirMinum?: number; // quantity in dus/karton
  hargaAirMinumPerDus?: number; // price per dus/karton
  parkir: number; // default 25000
  laundry: number; // default 20000
  qtyLaundryKg?: number; // quantity in kg
  hargaLaundryPerKg?: number; // price per kg
  sewaWasit?: number; // optional, e.g. 100000
  tarifWasitPerJam?: number; // rate of referee per hour
  durasiWasitJam?: number; // duration for referee
  fotografer?: number; // optional
  tarifFotograferPerJam?: number; // rate of photographer per hour
  durasiFotograferJam?: number; // duration for photographer
  videografer?: number; // optional
  tarifVideograferPerJam?: number; // rate of videographer per hour
  durasiVideograferJam?: number; // duration for videographer
  durasiJam?: number; // default 2
  sewaPerJam?: number; // rate per hour, default 100000
  customExpenseDeskripsi?: string;
  customExpenseJumlah?: number;
  attendance: MatchdayAttendance[];
  isSynced: boolean;
  jenisMatch?: 'Latihan Internal' | 'Sparing';
  kategoriCabang?: string;
}

