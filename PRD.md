PRD ProTrack: Aplikasi Tracking Progres Proyek
Versi 1.0 | Status: Draft | Bahasa: Indonesia
1. Ringkasan
ProTrack adalah web app untuk memantau progres pekerjaan proyek di biro konsultan konstruksi. Tim terdiri dari divisi Arsitek, MEP, Analisa Struktur, dan Admin. Owner bisa melihat persentase progres tiap proyek, tiap divisi, dan tiap PIC dalam satu dashboard, tanpa perlu tanya satu per satu ke tim.
2. Latar Belakang & Masalah
Saat ini progres pekerjaan umumnya dipantau lewat chat, spreadsheet, atau rapat lisan. Akibatnya:
• Owner sulit tahu posisi riil proyek tanpa bertanya ke tiap PIC.
• Progres tiap orang tidak terukur seragam, jadi angka "sudah 70%" bisa berarti beda-beda.
• Keterlambatan baru ketahuan setelah mendekati atau melewati deadline.
• Tidak ada riwayat perubahan progres yang bisa ditelusuri.
3. Tujuan & Metrik Keberhasilan
Tujuan utama: owner bisa melihat persentase progres proyek dan progres per PIC secara real-time dalam kurang dari 3 klik.
Metrik
Target
Waktu owner mengetahui status satu proyek
Kurang dari 1 menit
Task yang progresnya diperbarui minimal mingguan
90%
Task overdue yang terdeteksi sebelum lewat deadline
80%
PIC yang aktif update progres tiap minggu
90%
4. Di Luar Cakupan (Versi 1)
• Penyimpanan atau revisi file gambar/dokumen (cukup link eksternal).
• Aplikasi mobile native (cukup web responsif).
• Integrasi pihak ketiga (WhatsApp, Google Calendar) ditunda ke versi berikutnya.
5. Pengguna & Peran
Peran
Kebutuhan utama
Hak akses
Owner
Melihat progres semua proyek dan PIC
Read-only semua data, bisa komentar, bisa atur bobot divisi
Admin
Mengelola proyek, task, dan user
CRUD proyek, task, user; update task divisi Admin
PIC (Arsitek, MEP, Struktur)
Update progres pekerjaan sendiri
Hanya lihat proyek yang di-assign; update task milik sendiri
6. User Stories
Owner
• Sebagai owner, saya ingin melihat daftar semua proyek beserta persentase progresnya agar tahu mana yang perlu perhatian.
• Sebagai owner, saya ingin melihat progres per PIC di tiap proyek agar tahu kontribusi dan hambatan masing-masing.
• Sebagai owner, saya ingin tahu task yang overdue atau hampir deadline agar bisa ambil tindakan cepat.
• Sebagai owner, saya ingin mengunduh laporan progres agar bisa dibahas di rapat atau dikirim ke klien.
Admin
• Sebagai admin, saya ingin membuat proyek baru dari template task per divisi agar input tidak makan waktu.
• Sebagai admin, saya ingin meng-assign PIC dan menentukan bobot task agar perhitungan progres akurat.
• Sebagai admin, saya ingin mengelola akun user dan role agar akses terkontrol.
PIC
• Sebagai PIC, saya ingin melihat semua task saya di satu halaman agar tidak ada yang terlewat.
• Sebagai PIC, saya ingin update progres dengan cepat dari HP agar tidak merepotkan di sela kerja.
• Sebagai PIC, saya ingin menambah catatan saat update agar owner paham konteksnya.
7. Requirement Fungsional
Prioritas: P0 wajib di MVP, P1 penting, P2 nice to have.
7.1 Autentikasi & Akses (P0)
• Login dengan email dan password.
• Role-based access control (Owner, Admin, PIC).
• PIC hanya bisa melihat proyek yang di-assign ke dia.
• Admin bisa menonaktifkan user tanpa menghapus riwayatnya.
7.2 Manajemen Proyek (P0)
• CRUD proyek: nama, klien, lokasi, tanggal mulai, deadline, status (Aktif, On Hold, Selesai), deskripsi.
• Atur bobot divisi per proyek, total wajib 100%.
• Buat proyek dari template task per divisi (P1).
7.3 Manajemen Task (P0)
• CRUD task: judul, deskripsi, divisi, PIC, bobot, tanggal mulai, deadline, status, progres 0-100%, catatan.
• Status: Belum Mulai, Berjalan, Review, Selesai.
• Status Selesai otomatis menetapkan progres 100%.
• Task bisa diberi link dokumen eksternal (Google Drive, dll) (P1).
7.4 Update Progres (P0)
• PIC update progres lewat slider atau input angka, plus catatan singkat.
• Setiap update tercatat di log: siapa, kapan, dari berapa ke berapa, catatan.
• Komentar per task (P1).
7.5 Perhitungan Progres (P0)
• Progres PIC per proyek = rata-rata tertimbang (bobot task) dari task miliknya.
• Progres divisi = rata-rata tertimbang semua task divisi tersebut.
• Progres proyek = rata-rata tertimbang dari progres tiap divisi sesuai bobot divisi.
• Indikator status: hijau (sesuai atau lebih cepat dari jadwal), kuning (terlambat ringan), merah (overdue), berdasarkan progres aktual dibanding progres ideal menurut timeline.
7.6 Dashboard Owner (P0)
• Kartu ringkasan: jumlah proyek aktif, rata-rata progres, jumlah task overdue, proyek mendekati deadline.
• Daftar proyek dengan progress bar, deadline, dan indikator warna.
7.7 Detail Proyek (P0)
• Progres keseluruhan proyek ditampilkan besar dan jelas.
• Breakdown per divisi (bar chart) dan per PIC (tabel: nama, divisi, jumlah task, task selesai, persentase).
• Daftar task dengan filter divisi, PIC, dan status.
• Timeline atau Gantt sederhana (P1).
7.8 Halaman "Task Saya" untuk PIC (P0)
• Daftar task milik PIC, diurutkan berdasarkan deadline terdekat.
• Tombol cepat update progres.
7.9 Notifikasi (P1)
• Notifikasi in-app untuk task baru, H-3 deadline, dan overdue.
7.10 Laporan (P1)
• Export progres proyek ke PDF dan Excel/CSV.
7.11 Lain-lain
• Activity log per proyek (P1).
• Pencarian dan filter di semua daftar (P1).
• Dark mode (P2).
8. Requirement Non-Fungsional
• Performa: halaman dashboard termuat kurang dari 3 detik untuk hingga 50 proyek aktif.
• Keamanan: password ter-hash, data dibatasi per role di level database (row-level security), koneksi HTTPS.
• Responsif: nyaman dipakai di HP (PIC) dan desktop (owner).
• Bahasa: seluruh antarmuka Bahasa Indonesia.
• Ketersediaan: target uptime 99% selama jam kerja.
• Audit: riwayat update progres tidak bisa dihapus oleh PIC.
9. Model Data (Ringkas)
Entitas
Atribut utama
User
id, nama, email, role, divisi, status aktif
Proyek
id, nama, klien, lokasi, tanggal mulai, deadline, status, deskripsi
Bobot Divisi
proyek_id, divisi, bobot (%)
Task
id, proyek_id, divisi, pic_id, judul, deskripsi, bobot, tanggal mulai, deadline, status, progres, catatan
Update Log
id, task_id, user_id, progres_lama, progres_baru, catatan, waktu
Komentar
id, task_id, user_id, isi, waktu
Notifikasi
id, user_id, tipe, pesan, sudah_dibaca, waktu
10. Alur Utama
1.  Admin membuat proyek, mengatur bobot divisi, lalu membuat task dari template dan meng-assign PIC.
2.  PIC login, membuka "Task Saya", lalu mengupdate progres dan catatan.
3.  Sistem menghitung ulang progres PIC, divisi, dan proyek secara otomatis.
4.  Owner membuka dashboard, melihat progres dan indikator warna, lalu masuk ke detail proyek bila perlu.
5.  Sistem mengirim notifikasi saat deadline mendekati atau terlewat.
11. Kebutuhan UI/UX
• Desain bersih dan profesional: dominan putih dengan satu warna aksen (biru tua).
• Angka persentase, progress bar, dan chart harus langsung terbaca tanpa banyak klik.
• Update progres PIC maksimal 3 langkah dari halaman "Task Saya".
• Warna indikator tidak jadi satu-satunya penanda (tambahkan label teks) agar mudah dibaca.
12. Rekomendasi Teknis
• Frontend: React/Next.js + Tailwind CSS.
• Backend dan database: Supabase (PostgreSQL + Auth + Row Level Security).
• Chart: Recharts atau Chart.js.
• Hosting: Vercel atau setara.
• Export PDF/Excel: library sisi server atau klien.
13. Rencana Rilis
Fase
Cakupan
Estimasi
MVP
Auth, proyek, task, update progres, perhitungan progres, Dashboard Owner, Detail Proyek, Task Saya
3-4 minggu
Fase 2
Notifikasi, komentar, template task, Gantt sederhana, filter dan pencarian
2-3 minggu
Fase 3
Laporan PDF/Excel, activity log, dark mode, penyempurnaan UI
2 minggu
Estimasi memakai AI builder dan bisa bergeser tergantung revisi.
14. Risiko & Mitigasi
Risiko
Dampak
Mitigasi
PIC malas atau lupa update progres
Data tidak akurat
Notifikasi pengingat, UI update super cepat, owner bisa lihat "terakhir diupdate"
Penilaian persen subjektif
Angka tidak bisa dipercaya
Pecah task kecil, beri panduan tahapan (misal 25/50/75/100)
Bobot task dan divisi salah
Progres proyek menyesatkan
Template bobot bawaan, validasi total 100%
Tim sulit adaptasi
App tidak dipakai
Mulai dengan 1 proyek pilot, training singkat