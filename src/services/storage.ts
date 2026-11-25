import { User, Project, DivisionWeight, Task, TaskStatus, UpdateLog, Comment, NotificationItem, Division } from '../types';

const STORAGE_KEYS = {
  USERS: 'protrack_users_v1',
  PROJECTS: 'protrack_projects_v1',
  DIVISION_WEIGHTS: 'protrack_division_weights_v1',
  TASKS: 'protrack_tasks_v1',
  LOGS: 'protrack_logs_v1',
  COMMENTS: 'protrack_comments_v1',
  NOTIFICATIONS: 'protrack_notifications_v1',
  ACTIVE_USER_ID: 'protrack_active_user_v1',
};

// Initial Seed Data according to PRD
const SEED_USERS: User[] = [
  {
    id: 'u-owner-1',
    nama: 'Ir. Hendra Kusuma',
    email: 'owner@protrack.id',
    password: 'owner123',
    role: 'Owner',
    divisi: '-',
    aktif: true,
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'u-admin-1',
    nama: 'Sari Wulandari, S.Kom',
    email: 'admin@protrack.id',
    password: 'admin123',
    role: 'Admin',
    divisi: 'Admin',
    aktif: true,
    created_at: '2026-08-01T08:30:00Z',
  },
  {
    id: 'u-pic-arsitek-1',
    nama: 'Bagus Pratama, S.Ars',
    email: 'bagus.arsitek@protrack.id',
    password: 'pic123',
    role: 'PIC',
    divisi: 'Arsitek',
    aktif: true,
    created_at: '2026-08-05T09:00:00Z',
  },
  {
    id: 'u-pic-arsitek-2',
    nama: 'Dina Lestari, S.Ars',
    email: 'dina.arsitek@protrack.id',
    password: 'pic123',
    role: 'PIC',
    divisi: 'Arsitek',
    aktif: true,
    created_at: '2026-08-05T09:15:00Z',
  },
  {
    id: 'u-pic-struktur-1',
    nama: 'Ir. Ahmad Zarkasih, MT',
    email: 'ahmad.struktur@protrack.id',
    password: 'pic123',
    role: 'PIC',
    divisi: 'Struktur',
    aktif: true,
    created_at: '2026-08-05T09:30:00Z',
  },
  {
    id: 'u-pic-mep-1',
    nama: 'Rian Firmansyah, ST',
    email: 'rian.mep@protrack.id',
    password: 'pic123',
    role: 'PIC',
    divisi: 'MEP',
    aktif: true,
    created_at: '2026-08-05T09:45:00Z',
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'p-1',
    nama: 'Menara Kompas Nusantara 12 Lantai',
    klien: 'PT Media Megatama Graha',
    lokasi: 'Jl. Sudirman Kav. 28, Jakarta Pusat',
    tanggal_mulai: '2026-09-01',
    deadline: '2027-02-28',
    status: 'Aktif',
    deskripsi: 'Perencanaan teknis menyeluruh (DED, RKS, BQ) pembangunan gedung kantor 12 lantai dengan 2 lantai basement.',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'p-2',
    nama: 'Rumah Sakit Ibu & Anak Kasih Ibu',
    klien: 'Yayasan Bina Medika Sejahtera',
    lokasi: 'Bintaro Sektor 7, Tangerang Selatan',
    tanggal_mulai: '2026-10-15',
    deadline: '2027-04-30',
    status: 'Aktif',
    deskripsi: 'Desain teknis gedung rawat inap dan poliklinik 5 lantai dengan spesifikasi tata udara ruang isolasi negatif.',
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 'p-3',
    nama: 'Resort & Villa Lembah Hijau',
    klien: 'PT Pesona Nusa Hospitality',
    lokasi: 'Ubud, Gianyar, Bali',
    tanggal_mulai: '2026-11-01',
    deadline: '2027-06-15',
    status: 'Aktif',
    deskripsi: 'Masterplan kawasan wisata dan desain detail 24 unit villa tropis terintegrasi sistem eco-drainase.',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 'p-4',
    nama: 'Gudang Logistik Modern Jababeka',
    klien: 'PT Indo Cargo Logistik',
    lokasi: 'Kawasan Industri Jababeka V, Cikarang',
    tanggal_mulai: '2026-07-01',
    deadline: '2026-11-15',
    status: 'Selesai',
    deskripsi: 'Desain struktur baja bentang lebar 45 meter dan utilitas pemadam kebakaran fire sprinkler otomatis.',
    created_at: '2026-07-01T08:00:00Z',
  },
];

const SEED_DIVISION_WEIGHTS: DivisionWeight[] = [
  // Proyek 1: Menara Kompas
  { id: 'dw-1-1', project_id: 'p-1', divisi: 'Arsitek', bobot: 40 },
  { id: 'dw-1-2', project_id: 'p-1', divisi: 'Struktur', bobot: 35 },
  { id: 'dw-1-3', project_id: 'p-1', divisi: 'MEP', bobot: 25 },

  // Proyek 2: RS Kasih Ibu
  { id: 'dw-2-1', project_id: 'p-2', divisi: 'Arsitek', bobot: 35 },
  { id: 'dw-2-2', project_id: 'p-2', divisi: 'Struktur', bobot: 30 },
  { id: 'dw-2-3', project_id: 'p-2', divisi: 'MEP', bobot: 35 }, // MEP RS berbobot besar (HVAC medis)

  // Proyek 3: Resort Ubud
  { id: 'dw-3-1', project_id: 'p-3', divisi: 'Arsitek', bobot: 50 },
  { id: 'dw-3-2', project_id: 'p-3', divisi: 'Struktur', bobot: 25 },
  { id: 'dw-3-3', project_id: 'p-3', divisi: 'MEP', bobot: 25 },

  // Proyek 4: Gudang
  { id: 'dw-4-1', project_id: 'p-4', divisi: 'Arsitek', bobot: 20 },
  { id: 'dw-4-2', project_id: 'p-4', divisi: 'Struktur', bobot: 50 },
  { id: 'dw-4-3', project_id: 'p-4', divisi: 'MEP', bobot: 30 },
];

const SEED_TASKS: Task[] = [
  // --- Proyek 1 (Menara Kompas) ---
  // Arsitek (Bagus Pratama & Dina Lestari)
  {
    id: 't-101',
    project_id: 'p-1',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-1',
    judul: 'Konsep Denah Tipikal Lantai 3-10',
    deskripsi: 'Penyusunan zonasi core lift, tangga darurat, toilet, dan efisiensi ruang sewa kantor.',
    bobot: 30,
    tanggal_mulai: '2026-09-01',
    deadline: '2026-10-15',
    status: 'Selesai',
    progres: 100,
    catatan: 'Disetujui klien pada asistensi tanggal 12 Okt 2026.',
    doc_link: 'https://drive.google.com/drive/folders/sample-protrack-ars-1',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 't-102',
    project_id: 'p-1',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-1',
    judul: 'Detail Gambar Fasad Curtain Wall & Sun Shading',
    deskripsi: 'Perhitungan thermal, detail sambungan mullion, dan spesifikasi double glazed glass.',
    bobot: 35,
    tanggal_mulai: '2026-10-16',
    deadline: '2026-12-15',
    status: 'Berjalan',
    progres: 75,
    catatan: 'Gambar potongan detail facade tuntas, finishing estimasi sambungan sudut lantai.',
    doc_link: 'https://drive.google.com/drive/folders/sample-facade-dwg',
    created_at: '2026-10-16T09:00:00Z',
  },
  {
    id: 't-103',
    project_id: 'p-1',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-2',
    judul: 'Pola Lantai & Plafon (RCP) Ground & Mezzanine',
    deskripsi: 'Desain layout lobi utama, lift lobby, dan integrasi titik lampu/diffuser AC.',
    bobot: 35,
    tanggal_mulai: '2026-11-01',
    deadline: '2027-01-20',
    status: 'Berjalan',
    progres: 50,
    catatan: 'Revisi grid plafon lantai mezzanine menyelaraskan balok drop panel struktur.',
    created_at: '2026-11-01T08:30:00Z',
  },

  // Struktur (Ahmad Zarkasih)
  {
    id: 't-104',
    project_id: 'p-1',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Pemodelan ETABS & Analisa Beban Gempa Response Spectrum',
    deskripsi: 'Analisa dinamik ragam spektrum gempa SNI 1726:2019 wilayah gempa Jakarta Pusat.',
    bobot: 35,
    tanggal_mulai: '2026-09-10',
    deadline: '2026-10-30',
    status: 'Selesai',
    progres: 100,
    catatan: 'Kapasitas geser seismik mencukupi, drift ratio di bawah 2% sesuai syarat.',
    doc_link: 'https://drive.google.com/drive/folders/etabs-calculation-p1',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: 't-105',
    project_id: 'p-1',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Perhitungan Pondasi Bored Pile & Secant Pile Basement',
    deskripsi: 'Analisis daya dukung tanah berdasarkan uji N-SPT, defleksi dinding penahan galian dalam.',
    bobot: 35,
    tanggal_mulai: '2026-10-20',
    deadline: '2026-11-28', // Hampir deadline/overdue
    status: 'Berjalan',
    progres: 85,
    catatan: 'Finalisasi penulangan pile cap gabungan di core lift.',
    created_at: '2026-10-20T09:00:00Z',
  },
  {
    id: 't-106',
    project_id: 'p-1',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Detail Penulangan Balok, Kolom Komposit, & Pelat Lantai',
    deskripsi: 'Penyusunan tabel pembesian balok tipikal dan shear wall boundary element.',
    bobot: 30,
    tanggal_mulai: '2026-11-15',
    deadline: '2027-02-10',
    status: 'Berjalan',
    progres: 40,
    catatan: 'Pembesian lantai 1-5 selesai digambar.',
    created_at: '2026-11-15T10:00:00Z',
  },

  // MEP (Rian Firmansyah)
  {
    id: 't-107',
    project_id: 'p-1',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Perhitungan Cooling Load & Skema Chilled Water HVAC',
    deskripsi: 'Beban pendinginan total 850 TR, sistem chiller sentral water-cooled.',
    bobot: 35,
    tanggal_mulai: '2026-10-01',
    deadline: '2026-11-20',
    status: 'Review',
    progres: 90,
    catatan: 'Menunggu review spesifikasi pompa sirkulasi sekunder dari konsultan MK.',
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 't-108',
    project_id: 'p-1',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Diagram Satu Garis (SLD) Listrik & Trafo Gardu 20kV',
    deskripsi: 'Distribusi beban utama, genset sinkronisasi 2 x 1000 kVA, busduct riser.',
    bobot: 35,
    tanggal_mulai: '2026-11-01',
    deadline: '2026-12-28',
    status: 'Berjalan',
    progres: 60,
    catatan: 'Jalur kabel shaft elektrikal telah disepakati bersama arsitek.',
    created_at: '2026-11-01T09:00:00Z',
  },
  {
    id: 't-109',
    project_id: 'p-1',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Sistem Plumbing & Sprinkler Pemadam Kebakaran',
    deskripsi: 'Skema roof tank, booster pump, hidran gedung kelas I, dan zonasi alarm valve.',
    bobot: 30,
    tanggal_mulai: '2026-11-15',
    deadline: '2027-01-30',
    status: 'Belum Mulai',
    progres: 0,
    catatan: '',
    created_at: '2026-11-15T09:00:00Z',
  },

  // --- Proyek 2 (RS Kasih Ibu) ---
  {
    id: 't-201',
    project_id: 'p-2',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-2',
    judul: 'Alur Sirkulasi Medis & Pemisahan Zonasi Steril',
    deskripsi: 'Sirkulasi pasien rawat, dokter, pengunjung, sampah medis infeksius.',
    bobot: 50,
    tanggal_mulai: '2026-10-15',
    deadline: '2026-11-25', // Overdue / H-0
    status: 'Berjalan',
    progres: 70,
    catatan: 'Ada catatan tambahan dari komite medik terkait pintu kedap ruang operasi.',
    created_at: '2026-10-15T11:00:00Z',
  },
  {
    id: 't-202',
    project_id: 'p-2',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-2',
    judul: 'Denah DED Ruang Rawat Inap & ICU',
    deskripsi: 'Kebutuhan bed head unit, gas medis wall, toilet ramah disabilitas.',
    bobot: 50,
    tanggal_mulai: '2026-11-10',
    deadline: '2027-01-15',
    status: 'Berjalan',
    progres: 30,
    catatan: '',
    created_at: '2026-11-10T08:00:00Z',
  },
  {
    id: 't-203',
    project_id: 'p-2',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Desain Balok Kantilever & Ruang Mesin MRI (Tanpa Getaran)',
    deskripsi: 'Analisa lendutan dinamis khusus lantai 1 area radiologi.',
    bobot: 100,
    tanggal_mulai: '2026-10-25',
    deadline: '2026-12-20',
    status: 'Berjalan',
    progres: 55,
    catatan: '',
    created_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 't-204',
    project_id: 'p-2',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Sistem Tata Udara HVAC Ruang Operasi & HEPA Filter 99.97%',
    deskripsi: 'Tekanan positif ruang OK, pertukaran udara min 20x per jam sesuai Permenkes.',
    bobot: 60,
    tanggal_mulai: '2026-11-01',
    deadline: '2026-12-30',
    status: 'Berjalan',
    progres: 45,
    catatan: 'Vendor AHU higienis sudah memberikan data dimensi teknis.',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 't-205',
    project_id: 'p-2',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Pipa Gas Medis (O2, N2O, Vacuum) & Nurse Call System',
    deskripsi: 'Piping tembaga degreased type L, manifold otomatis cadangan tabung.',
    bobot: 40,
    tanggal_mulai: '2026-11-15',
    deadline: '2027-02-15',
    status: 'Belum Mulai',
    progres: 0,
    catatan: '',
    created_at: '2026-11-15T08:00:00Z',
  },

  // --- Proyek 3 (Resort Ubud) ---
  {
    id: 't-301',
    project_id: 'p-3',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-1',
    judul: 'Site Plan Kontur Alami & Orientasi View Lembah',
    deskripsi: 'Cut and fill minimalis menjaga kelestarian pohon beringin purba di lokasi.',
    bobot: 40,
    tanggal_mulai: '2026-11-01',
    deadline: '2026-12-10',
    status: 'Berjalan',
    progres: 60,
    catatan: '3D modeling lansekap terasering sedang diproses.',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 't-302',
    project_id: 'p-3',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-1',
    judul: 'Detail Arsitektur Tradisional Bali & Ornamen Ukir Kayu',
    deskripsi: 'Proporsi Tri Hita Karana, atap sirap alang-alang komposit tahan api.',
    bobot: 60,
    tanggal_mulai: '2026-12-01',
    deadline: '2027-02-28',
    status: 'Belum Mulai',
    progres: 0,
    catatan: '',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 't-303',
    project_id: 'p-3',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Desain Dinding Penahan Tebing (Retaining Wall) & Kolam Renang Infinity',
    deskripsi: 'Kombinasi bored pile kantilever dengan cerucuk matras bambu di lereng curam.',
    bobot: 100,
    tanggal_mulai: '2026-11-15',
    deadline: '2027-01-30',
    status: 'Berjalan',
    progres: 20,
    catatan: 'Data geoteknik lereng sungai Ayung telah diterima.',
    created_at: '2026-11-15T08:00:00Z',
  },
  {
    id: 't-304',
    project_id: 'p-3',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Water Treatment Plant (WTP) & Pengolahan Air Limbah STP Biofilter',
    deskripsi: 'Zero run-off system, daur ulang air limbah untuk siram taman villa.',
    bobot: 100,
    tanggal_mulai: '2026-11-20',
    deadline: '2027-02-28',
    status: 'Belum Mulai',
    progres: 0,
    catatan: '',
    created_at: '2026-11-20T08:00:00Z',
  },

  // --- Proyek 4 (Gudang Logistik Selesai) ---
  {
    id: 't-401',
    project_id: 'p-4',
    divisi: 'Arsitek',
    pic_id: 'u-pic-arsitek-2',
    judul: 'Lay-out Dermaga Loading Dock & Sirkulasi Truk Kontainer',
    deskripsi: 'Radius putar trailer 40ft dan elevasi lantai dock leveler.',
    bobot: 100,
    tanggal_mulai: '2026-07-01',
    deadline: '2026-08-15',
    status: 'Selesai',
    progres: 100,
    catatan: 'Final diserahkan ke owner.',
    created_at: '2026-07-01T08:00:00Z',
  },
  {
    id: 't-402',
    project_id: 'p-4',
    divisi: 'Struktur',
    pic_id: 'u-pic-struktur-1',
    judul: 'Analisa Kuda-Kuda Baja Castellated Beam Bentang 45m',
    deskripsi: 'Stabilitas lateral bracing dan base plate angkur mutu tinggi.',
    bobot: 100,
    tanggal_mulai: '2026-07-15',
    deadline: '2026-09-30',
    status: 'Selesai',
    progres: 100,
    catatan: 'Lolos review uji lab struktur independen.',
    created_at: '2026-07-15T08:00:00Z',
  },
  {
    id: 't-403',
    project_id: 'p-4',
    divisi: 'MEP',
    pic_id: 'u-pic-mep-1',
    judul: 'Perencanaan Pompa Pemadam Diesel & Fire Hose Reel',
    deskripsi: 'NFPA 13 & 20 standard kapasitas 1500 GPM.',
    bobot: 100,
    tanggal_mulai: '2026-08-01',
    deadline: '2026-10-30',
    status: 'Selesai',
    progres: 100,
    catatan: 'Selesai dan serah terima dokumen.',
    created_at: '2026-08-01T08:00:00Z',
  },
];

const SEED_LOGS: UpdateLog[] = [
  {
    id: 'l-1',
    task_id: 't-102',
    user_id: 'u-pic-arsitek-1',
    user_nama: 'Bagus Pratama, S.Ars',
    progres_lama: 50,
    progres_baru: 75,
    catatan: 'Potongan detail curtain wall area sudut lantai tipikal selesai diselaraskan.',
    waktu: '2026-11-22T14:30:00Z',
  },
  {
    id: 'l-2',
    task_id: 't-105',
    user_id: 'u-pic-struktur-1',
    user_nama: 'Ir. Ahmad Zarkasih, MT',
    progres_lama: 70,
    progres_baru: 85,
    catatan: 'Perhitungan pile cap 4-pile selesai diuji lendutan galian.',
    waktu: '2026-11-23T11:00:00Z',
  },
  {
    id: 'l-3',
    task_id: 't-107',
    user_id: 'u-pic-mep-1',
    user_nama: 'Rian Firmansyah, ST',
    progres_lama: 80,
    progres_baru: 90,
    catatan: 'Skema chiller piping diserahkan ke tim MK untuk verifikasi head loss.',
    waktu: '2026-11-24T09:15:00Z',
  },
];

const SEED_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    task_id: 't-102',
    user_id: 'u-owner-1',
    user_nama: 'Ir. Hendra Kusuma',
    user_role: 'Owner',
    isi: 'Pastikan kaca fasad memiliki SHGC di bawah 0.28 agar hemat energi sesuai standar Green Building.',
    waktu: '2026-11-23T08:00:00Z',
  },
  {
    id: 'c-2',
    task_id: 't-102',
    user_id: 'u-pic-arsitek-1',
    user_nama: 'Bagus Pratama, S.Ars',
    user_role: 'PIC',
    isi: 'Siap Pak Hendra, kami menggunakan spek Low-E double glazing 6mm+12A+6mm dengan SHGC 0.26.',
    waktu: '2026-11-23T09:30:00Z',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    user_id: 'u-pic-struktur-1',
    tipe: 'deadline_h3',
    pesan: 'Task "Perhitungan Pondasi Bored Pile & Secant Pile" mendekati deadline (28 Nov 2026).',
    link_id: 't-105',
    sudah_dibaca: false,
    waktu: '2026-11-24T08:00:00Z',
  },
  {
    id: 'n-2',
    user_id: 'u-pic-arsitek-2',
    tipe: 'overdue',
    pesan: 'Task "Alur Sirkulasi Medis & Pemisahan Zonasi Steril" telah melewati deadline target.',
    link_id: 't-201',
    sudah_dibaca: false,
    waktu: '2026-11-24T08:00:00Z',
  },
  {
    id: 'n-3',
    user_id: 'u-owner-1',
    tipe: 'progress_updated',
    pesan: 'Bagus Pratama memperbarui progres "Detail Gambar Fasad Curtain Wall" menjadi 75%.',
    link_id: 't-102',
    sudah_dibaca: false,
    waktu: '2026-11-22T14:30:00Z',
  },
];

// Helper to safely load or initialize storage
function loadData<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifySubscribers();
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

type Subscriber = () => void;
const subscribers: Set<Subscriber> = new Set();

function notifySubscribers() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

export const StorageService = {
  subscribe(fn: Subscriber): () => void {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.DIVISION_WEIGHTS, JSON.stringify(SEED_DIVISION_WEIGHTS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(SEED_TASKS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(SEED_COMMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, SEED_USERS[0].id);
    notifySubscribers();
  },

  // USERS
  getUsers(): User[] {
    return loadData(STORAGE_KEYS.USERS, SEED_USERS);
  },
  getUser(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },
  saveUser(user: Partial<User> & { id?: string }): User {
    const users = this.getUsers();
    if (user.id) {
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user } as User;
        saveData(STORAGE_KEYS.USERS, users);
        return users[idx];
      }
    }
    const newUser: User = {
      id: user.id || `u-${Date.now()}`,
      nama: user.nama || 'User Baru',
      email: user.email || `user${Date.now()}@protrack.id`,
      password: user.password || 'protrack123',
      role: user.role || 'PIC',
      divisi: user.divisi || 'Arsitek',
      aktif: user.aktif !== undefined ? user.aktif : true,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  // ACTIVE USER / AUTH
  getActiveUser(): User | null {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!activeId) return null;
    const users = this.getUsers();
    const found = users.find((u) => u.id === activeId);
    if (found && found.aktif) return found;
    return null;
  },
  setActiveUser(userId: string | null) {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
    notifySubscribers();
  },
  login(email: string, password: string): { success: boolean; user?: User; message?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem ProTrack.' };
    }

    if (!user.aktif) {
      return { success: false, message: 'Akun ini telah dinonaktifkan oleh Administrator.' };
    }

    // Default password fallback for demo users if unset
    const validPassword = user.password || (user.role === 'Owner' ? 'owner123' : user.role === 'Admin' ? 'admin123' : 'pic123');

    if (password !== validPassword) {
      return { success: false, message: 'Password yang Anda masukkan salah.' };
    }

    this.setActiveUser(user.id);
    return { success: true, user };
  },
  logout() {
    this.setActiveUser(null);
  },

  // PROJECTS
  getProjects(): Project[] {
    return loadData(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  },
  getProject(id: string): Project | undefined {
    return this.getProjects().find((p) => p.id === id);
  },
  saveProject(project: Partial<Project> & { id?: string }): Project {
    const projects = this.getProjects();
    if (project.id) {
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = { ...projects[idx], ...project } as Project;
        saveData(STORAGE_KEYS.PROJECTS, projects);
        return projects[idx];
      }
    }
    const newProj: Project = {
      id: project.id || `p-${Date.now()}`,
      nama: project.nama || 'Proyek Tanpa Nama',
      klien: project.klien || 'Klien Umum',
      lokasi: project.lokasi || 'Indonesia',
      tanggal_mulai: project.tanggal_mulai || new Date().toISOString().split('T')[0],
      deadline: project.deadline || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      status: project.status || 'Aktif',
      deskripsi: project.deskripsi || '',
      created_at: new Date().toISOString(),
    };
    projects.push(newProj);
    saveData(STORAGE_KEYS.PROJECTS, projects);
    return newProj;
  },
  deleteProject(id: string) {
    const projects = this.getProjects().filter((p) => p.id !== id);
    saveData(STORAGE_KEYS.PROJECTS, projects);
    // Cascade delete weights and tasks
    const weights = this.getDivisionWeights().filter((w) => w.project_id !== id);
    saveData(STORAGE_KEYS.DIVISION_WEIGHTS, weights);
    const tasks = this.getTasks().filter((t) => t.project_id !== id);
    saveData(STORAGE_KEYS.TASKS, tasks);
  },

  // DIVISION WEIGHTS
  getDivisionWeights(): DivisionWeight[] {
    return loadData(STORAGE_KEYS.DIVISION_WEIGHTS, SEED_DIVISION_WEIGHTS);
  },
  getProjectWeights(projectId: string): DivisionWeight[] {
    return this.getDivisionWeights().filter((w) => w.project_id === projectId);
  },
  setProjectWeights(projectId: string, weights: { divisi: Division; bobot: number }[]) {
    let all = this.getDivisionWeights().filter((w) => w.project_id !== projectId);
    weights.forEach((w) => {
      all.push({
        id: `dw-${projectId}-${w.divisi.toLowerCase()}`,
        project_id: projectId,
        divisi: w.divisi,
        bobot: w.bobot,
      });
    });
    saveData(STORAGE_KEYS.DIVISION_WEIGHTS, all);
  },

  // TASKS
  getTasks(): Task[] {
    return loadData(STORAGE_KEYS.TASKS, SEED_TASKS);
  },
  getTask(id: string): Task | undefined {
    return this.getTasks().find((t) => t.id === id);
  },
  getProjectTasks(projectId: string): Task[] {
    return this.getTasks().filter((t) => t.project_id === projectId);
  },
  getPicTasks(picId: string): Task[] {
    return this.getTasks().filter((t) => t.pic_id === picId);
  },
  saveTask(task: Partial<Task> & { id?: string; project_id: string }): Task {
    const tasks = this.getTasks();
    let progres = task.progres !== undefined ? task.progres : 0;
    let status = task.status || 'Belum Mulai';

    // Business rule from PRD: status Selesai otomatis menetapkan progres 100%
    if (status === 'Selesai') progres = 100;
    else if (progres === 100) status = 'Selesai';
    else if (progres > 0 && status === 'Belum Mulai') status = 'Berjalan';

    if (task.id) {
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const old = tasks[idx];
        const updated: Task = {
          ...old,
          ...task,
          progres,
          status,
          updated_at: new Date().toISOString(),
        };
        tasks[idx] = updated;
        saveData(STORAGE_KEYS.TASKS, tasks);
        return updated;
      }
    }

    const newTask: Task = {
      id: task.id || `t-${Date.now()}`,
      project_id: task.project_id,
      divisi: task.divisi || 'Arsitek',
      pic_id: task.pic_id || SEED_USERS[2].id,
      judul: task.judul || 'Task Baru',
      deskripsi: task.deskripsi || '',
      bobot: task.bobot || 25,
      tanggal_mulai: task.tanggal_mulai || new Date().toISOString().split('T')[0],
      deadline: task.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status,
      progres,
      catatan: task.catatan || '',
      doc_link: task.doc_link || '',
      created_at: new Date().toISOString(),
    };
    tasks.push(newTask);
    saveData(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },
  deleteTask(id: string) {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    saveData(STORAGE_KEYS.TASKS, tasks);
  },

  // UPDATE PROGRESS WITH AUDIT LOG
  updateTaskProgress(params: {
    taskId: string;
    newProgress: number;
    notes: string;
    currentUser: User;
    newStatus?: TaskStatus;
  }): { task: Task; log: UpdateLog } {
    const task = this.getTask(params.taskId);
    if (!task) throw new Error('Task tidak ditemukan');

    const oldProgress = task.progres;
    let newProgress = Math.max(0, Math.min(100, Math.round(params.newProgress)));
    let status = params.newStatus || task.status;

    if (status === 'Selesai') newProgress = 100;
    else if (newProgress === 100) status = 'Selesai';
    else if (newProgress > 0 && status === 'Belum Mulai') status = 'Berjalan';

    // Save task
    const updatedTask = this.saveTask({
      ...task,
      progres: newProgress,
      status,
      catatan: params.notes || task.catatan,
    });

    // Create Audit Log (Permanent, cannot be deleted by PIC per PRD 8.0)
    const log: UpdateLog = {
      id: `l-${Date.now()}`,
      task_id: task.id,
      user_id: params.currentUser.id,
      user_nama: params.currentUser.nama,
      progres_lama: oldProgress,
      progres_baru: newProgress,
      catatan: params.notes || 'Pembaruan progres berkala',
      waktu: new Date().toISOString(),
    };
    const logs = this.getLogs();
    logs.unshift(log);
    saveData(STORAGE_KEYS.LOGS, logs);

    // Create in-app notification for owner
    const proj = this.getProject(task.project_id);
    this.addNotification({
      user_id: 'u-owner-1',
      tipe: 'progress_updated',
      pesan: `${params.currentUser.nama} memperbarui task "${task.judul}" (${proj?.nama || ''}) dari ${oldProgress}% ke ${newProgress}%.`,
      link_id: task.id,
    });

    return { task: updatedTask, log };
  },

  // LOGS
  getLogs(): UpdateLog[] {
    return loadData(STORAGE_KEYS.LOGS, SEED_LOGS);
  },
  getTaskLogs(taskId: string): UpdateLog[] {
    return this.getLogs().filter((l) => l.task_id === taskId);
  },

  // COMMENTS
  getComments(): Comment[] {
    return loadData(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
  },
  getTaskComments(taskId: string): Comment[] {
    return this.getComments().filter((c) => c.task_id === taskId);
  },
  addComment(comment: { taskId: string; isi: string; user: User }): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      task_id: comment.taskId,
      user_id: comment.user.id,
      user_nama: comment.user.nama,
      user_role: comment.user.role,
      isi: comment.isi,
      waktu: new Date().toISOString(),
    };
    comments.push(newComment);
    saveData(STORAGE_KEYS.COMMENTS, comments);
    return newComment;
  },

  // NOTIFICATIONS
  getNotifications(): NotificationItem[] {
    return loadData(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },
  getUserNotifications(userId: string): NotificationItem[] {
    return this.getNotifications()
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
  },
  addNotification(notif: Omit<NotificationItem, 'id' | 'sudah_dibaca' | 'waktu'>) {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `n-${Date.now()}`,
      sudah_dibaca: false,
      waktu: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx >= 0) {
      notifs[idx].sudah_dibaca = true;
      saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },
  markAllNotificationsRead(userId: string) {
    const notifs = this.getNotifications().map((n) => {
      if (n.user_id === userId) return { ...n, sudah_dibaca: true };
      return n;
    });
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
};
