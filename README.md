# ProTrack - Aplikasi Tracking Progres Proyek Biro Konsultan Konstruksi

Aplikasi web modern untuk memantau progres pekerjaan proyek di biro konsultan konstruksi (Arsitek, Struktur, MEP, Admin) sesuai dengan dokumen **PRD.md v1.0**.

---

## 🔐 Akses & Kredensial Login (PRD 7.1)

Aplikasi telah dilengkapi sistem autentikasi email & password lengkap dengan tombol **Quick Demo Fill** di halaman login.

| Peran (Role) | Nama Lengkap | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | Ir. Hendra Kusuma | `owner@protrack.id` | `owner123` | Read-only semua proyek, ekspor laporan PDF/Excel, komentar |
| **Admin** | Sari Wulandari, S.Kom | `admin@protrack.id` | `admin123` | CRUD proyek, kelola user & bobot divisi, template proyek |
| **PIC Arsitek** | Bagus Pratama, S.Ars | `bagus.arsitek@protrack.id` | `pic123` | Update progres task arsitektur, catatan log audit |
| **PIC Struktur** | Ir. Ahmad Zarkasih, MT | `ahmad.struktur@protrack.id` | `pic123` | Update progres analisa struktur, catatan log audit |
| **PIC MEP** | Rian Firmansyah, ST | `rian.mep@protrack.id` | `pic123` | Update progres utilitas MEP, catatan log audit |

---

## 🚀 Link Akses Online Langsung (Live)

- **Vercel Cloud (Global Edge):** [https://agile-flint-f3h2zsd.tmp.now](https://agile-flint-f3h2zsd.tmp.now)
- **Cloudflare Network (Real-time Live):** [https://hydraulic-trunk-okay-rebel.trycloudflare.com](https://hydraulic-trunk-okay-rebel.trycloudflare.com)
- **Lokal:** [http://127.0.0.1:3000](http://127.0.0.1:3000)

Untuk menjalankan server dev kapan saja di masa depan:
```bash
npm run dev
```

Untuk mem-build versi produksi:
```bash
npm run build
```

---

## 🌐 Cara Deploy Permanen ke Vercel atau Netlify

Jika ingin menghubungkan ke akun pribadi Vercel / Netlify secara permanen:

### Opsi 1: Vercel CLI (Direkomendasikan di PRD)
```bash
npx vercel login
npx vercel
```

### Opsi 2: Hubungkan via GitHub (Otomatis CI/CD)
1. Buat repository baru di GitHub (misal: `protrack-app`).
2. Push folder project ini ke repository tersebut:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi ProTrack v1.0"
   git branch -M main
   git remote add origin https://github.com/USERNAME/protrack-app.git
   git push -u origin main
   ```
3. Buka [vercel.com](https://vercel.com) atau [netlify.com](https://netlify.com) -> **Import Project** dari repository GitHub Anda.
4. Klik **Deploy** (Pengaturan build sudah otomatis terdeteksi: `npm run build` dan output `dist`).

---

## 👥 Pengujian Akun Pengguna (RBAC Simulation)
Gunakan **User Switcher** di pojok kanan atas aplikasi untuk berpindah peran:
- **Owner (Ir. Hendra Kusuma):** Monitoring seluruh proyek, rata-rata progres, overdue, dan ekspor laporan PDF/Excel.
- **Admin (Sari Wulandari):** CRUD proyek, atur bobot divisi (validasi 100%), buat proyek dari template, CRUD task, kelola staf.
- **PIC (Arsitek, Struktur, MEP):** Akses halaman **Task Saya**, update progres dengan slider/angka cepat (< 3 langkah), beri catatan audit log, dan diskusi komentar.
