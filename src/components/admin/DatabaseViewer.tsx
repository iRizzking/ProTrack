import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Database, Table, Key, FileCode, Download, RefreshCw, Eye, Check, Copy } from 'lucide-react';

export const DatabaseViewer: React.FC = () => {
  const [activeTable, setActiveTable] = useState<'projects' | 'tasks' | 'users' | 'division_weights' | 'logs' | 'comments' | 'notifications'>('projects');
  const [activeView, setActiveView] = useState<'inspector' | 'schema' | 'er_diagram'>('inspector');
  const [copied, setCopied] = useState(false);

  const users = StorageService.getUsers();
  const projects = StorageService.getProjects();
  const weights = StorageService.getDivisionWeights();
  const tasks = StorageService.getTasks();
  const logs = StorageService.getLogs();
  const comments = StorageService.getComments();
  const notifications = StorageService.getNotifications();

  const tables = [
    { id: 'projects', label: 'projects', count: projects.length, desc: 'Master data proyek konstruksi' },
    { id: 'tasks', label: 'tasks', count: tasks.length, desc: 'Task teknis & DED per divisi' },
    { id: 'division_weights', label: 'division_weights', count: weights.length, desc: 'Bobot divisi per proyek (Total 100%)' },
    { id: 'users', label: 'users', count: users.length, desc: 'Pengguna, role RBAC, dan divisi' },
    { id: 'logs', label: 'update_logs', count: logs.length, desc: 'Riwayat audit perubahan progres' },
    { id: 'comments', label: 'comments', count: comments.length, desc: 'Komentar diskusi task' },
    { id: 'notifications', label: 'notifications', count: notifications.length, desc: 'Notifikasi H-3, overdue, dan progres' },
  ];

  const getTableData = () => {
    switch (activeTable) {
      case 'projects': return projects;
      case 'tasks': return tasks;
      case 'division_weights': return weights;
      case 'users': return users;
      case 'logs': return logs;
      case 'comments': return comments;
      case 'notifications': return notifications;
      default: return [];
    }
  };

  const currentData = getTableData();
  const columns = currentData.length > 0 ? Object.keys(currentData[0]) : [];

  const handleExportJSON = () => {
    const fullDb = {
      exported_at: new Date().toISOString(),
      system: 'ProTrack Database Backup v1.0',
      tables: {
        users,
        projects,
        division_weights: weights,
        tasks,
        update_logs: logs,
        comments,
        notifications,
      },
    };
    const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protrack_db_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sqlSchemaSnippet = `-- PostgreSQL / Supabase Schema (PRD Bagian 9 & 12)
CREATE TYPE user_role AS ENUM ('Owner', 'Admin', 'PIC');
CREATE TYPE user_division AS ENUM ('Arsitek', 'Struktur', 'MEP', 'Admin', '-');
CREATE TYPE project_status AS ENUM ('Aktif', 'On Hold', 'Selesai');
CREATE TYPE task_status AS ENUM ('Belum Mulai', 'Berjalan', 'Review', 'Selesai');

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PIC',
    divisi user_division NOT NULL DEFAULT 'Arsitek',
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    klien VARCHAR(200) NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    tanggal_mulai DATE NOT NULL,
    deadline DATE NOT NULL,
    status project_status NOT NULL DEFAULT 'Aktif',
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DIVISION WEIGHTS (Total 100%)
CREATE TABLE division_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    divisi user_division NOT NULL,
    bobot NUMERIC(5,2) NOT NULL CHECK (bobot >= 0 AND bobot <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TASKS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    divisi user_division NOT NULL,
    pic_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    judul VARCHAR(255) NOT NULL,
    bobot NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    tanggal_mulai DATE NOT NULL,
    deadline DATE NOT NULL,
    status task_status NOT NULL DEFAULT 'Belum Mulai',
    progres NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    catatan TEXT,
    doc_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. UPDATE LOGS (Audit Trail)
CREATE TABLE update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    progres_lama NUMERIC(5,2) NOT NULL,
    progres_baru NUMERIC(5,2) NOT NULL,
    catatan TEXT NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COMMENTS
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    isi TEXT NOT NULL,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipe VARCHAR(50) NOT NULL,
    pesan TEXT NOT NULL,
    sudah_dibaca BOOLEAN DEFAULT FALSE,
    waktu TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Database Architecture & Data Viewer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Struktur Database ProTrack
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspeksi model data (PRD Bagian 9), relasi tabel, record aktif, dan skema SQL siap pakai untuk PostgreSQL / Supabase.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Backup Data JSON</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (Inspector vs ER Diagram vs SQL Schema) */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveView('inspector')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeView === 'inspector'
              ? 'border-brand-600 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Live Data Inspector</span>
        </button>

        <button
          onClick={() => setActiveView('er_diagram')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeView === 'er_diagram'
              ? 'border-brand-600 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Struktur Relasi Tabel (ERD)</span>
        </button>

        <button
          onClick={() => setActiveView('schema')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
            activeView === 'schema'
              ? 'border-brand-600 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Skema SQL (PostgreSQL / Supabase)</span>
        </button>
      </div>

      {/* VIEW 1: LIVE DATA INSPECTOR */}
      {activeView === 'inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Daftar Tabel ({tables.length})
            </span>
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTable(t.id as any)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  activeTable === t.id
                    ? 'bg-brand-50/80 border-brand-300 text-brand-900 shadow-sm ring-1 ring-brand-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="font-mono text-xs font-bold block">{t.label}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 ml-2">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table Data Preview */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-brand-900">{activeTable}</span>
                <span className="text-xs text-slate-400">({currentData.length} records)</span>
              </div>
              <span className="text-[11px] text-slate-500">Live LocalStorage Data</span>
            </div>

            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap bg-slate-50">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length || 1} className="py-12 text-center text-slate-400">
                        Tabel kosong (tidak ada data).
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row: any, i) => (
                      <tr key={row.id || i} className="hover:bg-slate-50/80 transition">
                        {columns.map((col) => {
                          const val = row[col];
                          const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
                          return (
                            <td key={col} className="py-2.5 px-3 text-slate-700 whitespace-nowrap max-w-xs truncate" title={display}>
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ER DIAGRAM (Relasi Tabel) */}
      {activeView === 'er_diagram' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Visualisasi Skema Entitas Relasi (Entity-Relationship)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hubungan Foreign Key (FK) antar tabel sesuai aturan bisnis ProTrack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Table Card: Projects */}
            <div className="p-4 rounded-xl border-2 border-brand-200 bg-brand-50/30 space-y-2">
              <div className="flex items-center justify-between border-b border-brand-200 pb-2">
                <span className="font-mono font-bold text-xs text-brand-900">projects</span>
                <span className="text-[10px] bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded font-bold">Parent</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="font-bold text-brand-700">🔑 id (UUID, PK)</li>
                <li>nama (VARCHAR)</li>
                <li>klien (VARCHAR)</li>
                <li>lokasi (VARCHAR)</li>
                <li>tanggal_mulai (DATE)</li>
                <li>deadline (DATE)</li>
                <li>status (ENUM)</li>
              </ul>
            </div>

            {/* Table Card: Division Weights */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono font-bold text-xs text-slate-900">division_weights</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">Child</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="font-bold text-slate-900">🔑 id (UUID, PK)</li>
                <li className="text-blue-600 font-semibold">🔗 project_id (FK → projects.id)</li>
                <li>divisi (ENUM: Arsitek/Struktur/MEP)</li>
                <li className="font-bold text-emerald-700">bobot (NUMERIC, Total = 100%)</li>
              </ul>
            </div>

            {/* Table Card: Users */}
            <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/30 space-y-2">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="font-mono font-bold text-xs text-purple-900">users</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">RBAC</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="font-bold text-purple-700">🔑 id (UUID, PK)</li>
                <li>nama (VARCHAR)</li>
                <li>email (VARCHAR, UNIQUE)</li>
                <li>password_hash (VARCHAR)</li>
                <li className="font-bold">role (Owner / Admin / PIC)</li>
                <li>divisi (Arsitek / Struktur / MEP)</li>
                <li>aktif (BOOLEAN)</li>
              </ul>
            </div>

            {/* Table Card: Tasks */}
            <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-mono font-bold text-xs text-emerald-900">tasks</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Core</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="font-bold text-emerald-700">🔑 id (UUID, PK)</li>
                <li className="text-blue-600 font-semibold">🔗 project_id (FK → projects.id)</li>
                <li className="text-purple-600 font-semibold">🔗 pic_id (FK → users.id)</li>
                <li>judul (VARCHAR)</li>
                <li>bobot (NUMERIC %)</li>
                <li>status (Belum/Berjalan/Review/Selesai)</li>
                <li className="font-bold text-emerald-700">progres (0 - 100%)</li>
              </ul>
            </div>

            {/* Table Card: Update Logs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono font-bold text-xs text-slate-900">update_logs</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Audit</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="font-bold text-slate-900">🔑 id (UUID, PK)</li>
                <li className="text-emerald-600 font-semibold">🔗 task_id (FK → tasks.id)</li>
                <li className="text-purple-600 font-semibold">🔗 user_id (FK → users.id)</li>
                <li>progres_lama (NUMERIC)</li>
                <li>progres_baru (NUMERIC)</li>
                <li>catatan (TEXT)</li>
                <li>waktu (TIMESTAMP)</li>
              </ul>
            </div>

            {/* Table Card: Comments & Notifs */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono font-bold text-xs text-slate-900">comments & notifications</span>
              </div>
              <ul className="text-xs font-mono space-y-1 text-slate-700">
                <li className="text-emerald-600 font-semibold">🔗 task_id (FK → tasks.id)</li>
                <li className="text-purple-600 font-semibold">🔗 user_id (FK → users.id)</li>
                <li>isi (TEXT) / pesan (TEXT)</li>
                <li>tipe (deadline_h3 / overdue / updated)</li>
                <li>waktu (TIMESTAMP)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SQL DDL SCHEMA */}
      {activeView === 'schema' && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-brand-400" />
              <span className="font-mono text-xs font-bold text-white">supabase_schema.sql (PostgreSQL DDL)</span>
            </div>
            <button
              onClick={handleCopySQL}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] p-2 leading-relaxed">
            {sqlSchemaSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
