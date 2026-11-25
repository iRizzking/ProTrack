import { Division } from '../types';

export interface TaskTemplateItem {
  judul: string;
  deskripsi: string;
  divisi: Division;
  bobot: number;
  durasiHari: number; // estimasi durasi dari tanggal mulai proyek
}

export interface ProjectTemplate {
  id: string;
  nama: string;
  deskripsi: string;
  defaultWeights: { divisi: Division; bobot: number }[];
  tasks: TaskTemplateItem[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'gedung-bertingkat',
    nama: 'Gedung Bertingkat / Kantor (DED Komprehensif)',
    deskripsi: 'Template lengkap untuk proyek perkantoran, hotel, atau apartemen bertingkat.',
    defaultWeights: [
      { divisi: 'Arsitek', bobot: 40 },
      { divisi: 'Struktur', bobot: 35 },
      { divisi: 'MEP', bobot: 25 },
    ],
    tasks: [
      // Arsitek
      {
        judul: 'Penyusunan Konsep Desain & Skematik Arsitektur',
        deskripsi: 'Zonasi ruang, sirkulasi vertikal/horizontal, dan master denah tipikal.',
        divisi: 'Arsitek',
        bobot: 25,
        durasiHari: 30,
      },
      {
        judul: 'Pengembangan Gambar DED Denah & Tampak Fasad',
        deskripsi: 'Detail denah semua lantai, tampak 4 sisi, dan spesifikasi material eksterior.',
        divisi: 'Arsitek',
        bobot: 35,
        durasiHari: 60,
      },
      {
        judul: 'Gambar Potongan Utama, Tangga, & Detail Khusus Toilet/Lobi',
        deskripsi: 'Detail arsitektural detail waterproofing, kusen jendela, dan finishing.',
        divisi: 'Arsitek',
        bobot: 40,
        durasiHari: 90,
      },
      // Struktur
      {
        judul: 'Analisa Pemodelan Struktur Gempa 3D & Response Spectrum',
        deskripsi: 'Perhitungan beban mati, hidup, angin, gempa dinamik sesuai SNI terbaru.',
        divisi: 'Struktur',
        bobot: 35,
        durasiHari: 45,
      },
      {
        judul: 'Perhitungan Daya Dukung Pondasi & Rekayasa Tanah Galian',
        deskripsi: 'Perencanaan bored pile/tiang pancang, pile cap, dan perkuatan basement.',
        divisi: 'Struktur',
        bobot: 35,
        durasiHari: 60,
      },
      {
        judul: 'Gambar DED Pembesian Kolom, Balok, & Plat Lantai Tipikal',
        deskripsi: 'Tabel tulangan geser/lentur, sambungan lewatan, dan bar bending schedule.',
        divisi: 'Struktur',
        bobot: 30,
        durasiHari: 90,
      },
      // MEP
      {
        judul: 'Perhitungan Beban Listrik, Trafo, Genset, & Single Line Diagram',
        deskripsi: 'Kapasitas daya PLN, distribusi panel SDP/MDP, sistem proteksi petir.',
        divisi: 'MEP',
        bobot: 35,
        durasiHari: 60,
      },
      {
        judul: 'Perencanaan Sistem Tata Udara HVAC & Ventilasi Mekanikal',
        deskripsi: 'Cooling load calculation, zonasi chiller/VRF, jalur ducting & diffuser.',
        divisi: 'MEP',
        bobot: 35,
        durasiHari: 75,
      },
      {
        judul: 'Perencanaan Plumbing Air Bersih, Air Kotor, & Hydrant/Sprinkler',
        deskripsi: 'Kapasitas ground water tank, pompa booster, instalasi pipa pemadam kebakaran.',
        divisi: 'MEP',
        bobot: 30,
        durasiHari: 90,
      },
    ],
  },
  {
    id: 'rumah-sakit',
    nama: 'Fasilitas Kesehatan / Rumah Sakit Tipe C/B',
    deskripsi: 'Template khusus fasilitas medis dengan penekanan standar Permenkes dan HVAC higienis.',
    defaultWeights: [
      { divisi: 'Arsitek', bobot: 35 },
      { divisi: 'Struktur', bobot: 30 },
      { divisi: 'MEP', bobot: 35 },
    ],
    tasks: [
      {
        judul: 'Masterplan & Alur Sirkulasi Medis (Zonasi Bersih/Kotor/Infeksius)',
        deskripsi: 'Pemisahan sirkulasi pasien, pengunjung, staf medis, logistik gizi dan obat.',
        divisi: 'Arsitek',
        bobot: 50,
        durasiHari: 40,
      },
      {
        judul: 'DED Ruang Operasi (OK), ICU, Ruang Isolasi, & Rawat Inap',
        deskripsi: 'Material anti-bakteri, pintu kedap udara hermetik, sanitair medis.',
        divisi: 'Arsitek',
        bobot: 50,
        durasiHari: 90,
      },
      {
        judul: 'Struktur Tahan Gempa Khusus Rumah Sakit (Faktor Keutamaan Ie = 1.5)',
        deskripsi: 'Struktur gedung darurat bencana, perkuatan lantai beban alat radiologi/CT Scan.',
        divisi: 'Struktur',
        bobot: 100,
        durasiHari: 75,
      },
      {
        judul: 'Sistem HVAC Tekanan Negatif/Positif & Filtrasi HEPA Filter',
        deskripsi: 'Tata udara higienis ruang operasi dan ruang isolasi infeksi airborne.',
        divisi: 'MEP',
        bobot: 50,
        durasiHari: 90,
      },
      {
        judul: 'Instalasi Jaringan Pipa Gas Medis Sentral & Genset Siaga Tanpa Jedah',
        deskripsi: 'Outlet O2, N2O, Vacuum, genset otomatis transfer switch (ATS) respon < 10 detik.',
        divisi: 'MEP',
        bobot: 50,
        durasiHari: 90,
      },
    ],
  },
];
