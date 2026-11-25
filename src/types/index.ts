export type Role = 'Owner' | 'Admin' | 'PIC';
export type Division = 'Arsitek' | 'Struktur' | 'MEP' | 'Admin';
export type ProjectStatus = 'Aktif' | 'On Hold' | 'Selesai';
export type TaskStatus = 'Belum Mulai' | 'Berjalan' | 'Review' | 'Selesai';
export type IndicatorColor = 'green' | 'yellow' | 'red' | 'gray';

export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: Role;
  divisi: Division | '-';
  aktif: boolean;
  avatar?: string;
  created_at: string;
}

export interface DivisionWeight {
  id: string;
  project_id: string;
  divisi: Division;
  bobot: number; // in percentage, total 100%
}

export interface Project {
  id: string;
  nama: string;
  klien: string;
  lokasi: string;
  tanggal_mulai: string;
  deadline: string;
  status: ProjectStatus;
  deskripsi?: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  divisi: Division;
  pic_id: string;
  judul: string;
  deskripsi?: string;
  bobot: number; // Bobot di dalam divisinya (misal 20, 25, 30)
  tanggal_mulai: string;
  deadline: string;
  status: TaskStatus;
  progres: number; // 0 - 100
  catatan?: string;
  doc_link?: string; // Link gdrive dll
  created_at: string;
  updated_at?: string;
}

export interface UpdateLog {
  id: string;
  task_id: string;
  user_id: string;
  user_nama: string;
  progres_lama: number;
  progres_baru: number;
  catatan: string;
  waktu: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_nama: string;
  user_role: Role;
  isi: string;
  waktu: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  tipe: 'task_assigned' | 'deadline_h3' | 'overdue' | 'progress_updated';
  pesan: string;
  link_id?: string; // project_id or task_id
  sudah_dibaca: boolean;
  waktu: string;
}

export interface StatusIndicator {
  color: IndicatorColor;
  label: string;
  description: string;
  idealProgress?: number;
  diff?: number;
}
