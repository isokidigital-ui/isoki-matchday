import { Member, Transaction } from './types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_1',
    kodeMember: 'GBMFC001',
    nama: 'Budi',
    noHp: '081234567890',
    posisi: 'Player',
    aktif: false,
  },
  {
    id: 'mem_2',
    kodeMember: 'GBMFC002',
    nama: 'Rizki',
    noHp: '081298765432',
    posisi: 'Player',
    aktif: false,
  },
  {
    id: 'mem_3',
    kodeMember: 'GBMFC003',
    nama: 'Hamzah',
    noHp: '087887974866',
    posisi: 'Keeper',
    aktif: true,
  },
  {
    id: 'mem_4',
    kodeMember: 'GBMFC004',
    nama: 'Agus',
    noHp: '081250121731',
    posisi: 'Player',
    aktif: true,
  },
  {
    id: 'mem_5',
    kodeMember: 'GBMFC005',
    nama: 'Yayan',
    noHp: '082119526380',
    posisi: 'Player',
    aktif: true,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    tanggal: '2026-06-10',
    deskripsi: 'Iuran Bulanan - Budi',
    jumlah: 50000,
    tipe: 'Pemasukan',
    kategori: 'Iuran Member',
    kodeMember: 'GBMFC001',
  },
  {
    id: 'tx_2',
    tanggal: '2026-06-12',
    deskripsi: 'Sewa Lapangan Futsal Lap (2 Jam)',
    jumlah: 350000,
    tipe: 'Pengeluaran',
    kategori: 'Sewa Lapangan',
  },
  {
    id: 'tx_3',
    tanggal: '2026-06-15',
    deskripsi: 'Iuran Bulanan - Yayan',
    jumlah: 50000,
    tipe: 'Pemasukan',
    kategori: 'Iuran Member',
    kodeMember: 'GBMFC005',
  },
  {
    id: 'tx_4',
    tanggal: '2026-06-15',
    deskripsi: 'Iuran Bulanan - Hamzah',
    jumlah: 50000,
    tipe: 'Pemasukan',
    kategori: 'Iuran Member',
    kodeMember: 'GBMFC003',
  },
  {
    id: 'tx_5',
    tanggal: '2026-06-18',
    deskripsi: 'Konsumsi Air Mineral 2 Galon',
    jumlah: 45000,
    tipe: 'Pengeluaran',
    kategori: 'Konsumsi',
  },
  {
    id: 'tx_6',
    tanggal: '2026-06-19',
    deskripsi: 'Dana Sponsor Isoki Apparel',
    jumlah: 1500000,
    tipe: 'Pemasukan',
    kategori: 'Sponsor',
  },
  {
    id: 'tx_7',
    tanggal: '2026-06-20',
    deskripsi: 'Tiket Registrasi Matchday #12',
    jumlah: 450000,
    tipe: 'Pemasukan',
    kategori: 'Tiket Matchday',
  },
  {
    id: 'tx_8',
    tanggal: '2026-06-20',
    deskripsi: 'Beli 2 Bola Baru & Rompi Tim',
    jumlah: 250000,
    tipe: 'Pengeluaran',
    kategori: 'Perlengkapan',
  },
];

export const FINANCIAL_CATEGORIES = {
  Pemasukan: ['Iuran Member', 'Sponsor', 'Tiket Matchday', 'Donasi', 'Lain-lain'],
  Pengeluaran: ['Sewa Lapangan', 'Konsumsi', 'Perlengkapan', 'Operasional', 'Wasit', 'Lain-lain'],
};
