-- ============================================================================
-- PROTRACK DATABASE SCHEMA (PostgreSQL / Supabase)
-- Versi 1.0 | Sesuai PRD.md Bagian 9 & 12
-- ============================================================================

-- 1. EXTENSIONS & CUSTOM ENUM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('Owner', 'Admin', 'PIC');
CREATE TYPE user_division AS ENUM ('Arsitek', 'Struktur', 'MEP', 'Admin', '-');
CREATE TYPE project_status AS ENUM ('Aktif', 'On Hold', 'Selesai');
CREATE TYPE task_status AS ENUM ('Belum Mulai', 'Berjalan', 'Review', 'Selesai');
CREATE TYPE notif_type AS ENUM ('task_assigned', 'deadline_h3', 'overdue', 'progress_updated');

-- ============================================================================
-- 2. TABEL: USERS (Pengguna & Hak Akses)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PIC',
    divisi user_division NOT NULL DEFAULT 'Arsitek',
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Data pengguna biro konsultan dengan role Owner, Admin, dan PIC per divisi.';

-- ============================================================================
-- 3. TABEL: PROJECTS (Proyek Konstruksi)
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    klien VARCHAR(200) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    deadline DATE NOT NULL,
    status project_status NOT NULL DEFAULT 'Aktif',
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_project_dates CHECK (deadline >= tanggal_mulai)
);

COMMENT ON TABLE projects IS 'Daftar proyek konstruksi yang ditangani biro konsultan.';

-- ============================================================================
-- 4. TABEL: DIVISION_WEIGHTS (Bobot Divisi per Proyek)
-- ============================================================================
CREATE TABLE division_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    divisi user_division NOT NULL,
    bobot NUMERIC(5,2) NOT NULL CHECK (bobot >= 0 AND bobot <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_project_divisi UNIQUE (project_id, divisi)
);

COMMENT ON TABLE division_weights IS 'Pembobotan divisi per proyek (Arsitek, Struktur, MEP). Total wajib 100%.';

-- ============================================================================
-- 5. TABEL: TASKS (Pekerjaan / DED Gambar Teknis)
-- ============================================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    divisi user_division NOT NULL,
    pic_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    bobot NUMERIC(5,2) NOT NULL DEFAULT 25.00 CHECK (bobot > 0 AND bobot <= 100),
    tanggal_mulai DATE NOT NULL,
    deadline DATE NOT NULL,
    status task_status NOT NULL DEFAULT 'Belum Mulai',
    progres NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (progres >= 0 AND progres <= 100),
    catatan TEXT,
    doc_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_task_dates CHECK (deadline >= tanggal_mulai)
);

COMMENT ON TABLE tasks IS 'Rincian task teknis dengan bobot internal divisi dan progres 0-100%.';

-- ============================================================================
-- 6. TABEL: UPDATE_LOGS (Log Riwayat Audit Progres - Tidak dapat dihapus PIC)
-- ============================================================================
CREATE TABLE update_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    progres_lama NUMERIC(5,2) NOT NULL,
    progres_baru NUMERIC(5,2) NOT NULL,
    catatan TEXT NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE update_logs IS 'Riwayat log audit update progres mingguan/harian untuk kebutuhan audit Owner.';

-- ============================================================================
-- 7. TABEL: COMMENTS (Diskusi / Komentar Task)
-- ============================================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    isi TEXT NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE comments IS 'Catatan diskusi instruksi owner dan tanggapan PIC per task.';

-- ============================================================================
-- 8. TABEL: NOTIFICATIONS (Notifikasi Sistem In-App)
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipe notif_type NOT NULL,
    pesan TEXT NOT NULL,
    link_id VARCHAR(100),
    sudah_dibaca BOOLEAN NOT NULL DEFAULT FALSE,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notifikasi in-app untuk batas deadline H-3, overdue, dan update progres.';

-- ============================================================================
-- 9. INDEXES UNTUK PERFORMA TINGGI (Target PRD < 3 Detik)
-- ============================================================================
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_pic ON tasks(pic_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_update_logs_task ON update_logs(task_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_notif_user ON notifications(user_id, sudah_dibaca);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) SESUAI PRD 7.1 & 8.0
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy contoh: Owner & Admin dapat membaca seluruh proyek
CREATE POLICY "Owner & Admin view all projects" 
    ON projects FOR SELECT 
    USING (auth.jwt() ->> 'role' IN ('Owner', 'Admin'));

-- Policy contoh: PIC hanya melihat proyek yang ditugaskan
CREATE POLICY "PIC view assigned projects" 
    ON projects FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.project_id = projects.id 
            AND tasks.pic_id = auth.uid()
        )
    );

-- Policy: PIC hanya bisa update progres task milik sendiri
CREATE POLICY "PIC update own tasks" 
    ON tasks FOR UPDATE 
    USING (pic_id = auth.uid());
