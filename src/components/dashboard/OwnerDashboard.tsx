import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ProgressEngine } from '../../services/progressEngine';
import { formatDateIndo } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { IndicatorBadge, ProjectStatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import {
  FolderKanban,
  TrendingUp,
  AlertOctagon,
  Clock,
  Plus,
  Calendar,
  ChevronRight,
  Search,
} from 'lucide-react';
import { ProjectModal } from '../projects/ProjectModal';

interface OwnerDashboardProps {
  onSelectProject: (projectId: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onSelectProject }) => {
  const { currentUser, isAdmin } = useAuth();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const projects = StorageService.getProjects();
  const activeProjects = projects.filter((p) => p.status === 'Aktif');
  const avgProgress = ProgressEngine.getAverageActiveProjectsProgress();
  const totalOverdueTasks = ProgressEngine.countOverdueTasks();
  const approachingTasks = ProgressEngine.getApproachingDeadlineTasks(3);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nama.toLowerCase().includes(q) ||
        p.klien.toLowerCase().includes(q) ||
        p.lokasi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Executive Welcome Bar */}
      <div className="bg-slate-900 rounded-xl p-4 sm:p-6 text-white border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Executive Dashboard
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Real-time Data</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight">
            Selamat Datang, {currentUser?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pantau status progres pekerjaan proyek, performa tiap divisi, dan kendala PIC dalam satu layar terpusat.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards (2 cols on mobile, 4 on desktop - responsive & clean) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Proyek Aktif */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Proyek Aktif
            </span>
            <FolderKanban className="w-4 h-4 text-brand-700" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{activeProjects.length}</span>
              <span className="text-xs text-slate-400">/ {projects.length} Total</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Sedang dalam pengerjaan</p>
          </div>
        </div>

        {/* Rata-rata Progres */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata Progres
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{avgProgress}%</span>
              <span className="text-xs text-emerald-600 font-semibold">Aktif</span>
            </div>
            <div className="mt-1 w-full">
              <ProgressBar progress={avgProgress} height="sm" />
            </div>
          </div>
        </div>

        {/* Task Overdue */}
        <div
          className={`rounded-xl p-3.5 sm:p-4 border shadow-sm flex flex-col justify-between ${
            totalOverdueTasks > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Task Overdue
            </span>
            <AlertOctagon className={`w-4 h-4 ${totalOverdueTasks > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-black ${totalOverdueTasks > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {totalOverdueTasks}
              </span>
              <span className="text-xs text-slate-400">Task terdeteksi</span>
            </div>
            <p className={`text-[10px] mt-0.5 ${totalOverdueTasks > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}`}>
              {totalOverdueTasks > 0 ? 'Perlu tindakan cepat' : 'Tidak ada keterlambatan'}
            </p>
          </div>
        </div>

        {/* Mendekati Deadline (H-3) */}
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Batas Deadline
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {approachingTasks.length}
              </span>
              <span className="text-xs text-slate-400">Task (H-3)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Mendekati target selesai</p>
          </div>
        </div>
      </div>

      {/* Daftar Proyek & Monitoring Progress */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filter Controls (Collapses cleanly without crowding on mobile) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Monitoring Progres Seluruh Proyek
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada proyek untuk membuka rincian breakdown divisi dan kontribusi PIC.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari proyek / klien..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none w-full min-h-[38px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none bg-white font-medium flex-1 sm:flex-none min-h-[38px]"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="On Hold">On Hold</option>
                <option value="Selesai">Selesai</option>
              </select>

              {isAdmin && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white text-xs font-bold rounded-lg shadow-sm transition shrink-0 min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Proyek Baru</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project List Rows */}
        <div className="divide-y divide-slate-100">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Tidak ada proyek yang sesuai dengan kriteria pencarian.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const progress = ProgressEngine.calculateProjectProgress(p.id);
              const indicator = ProgressEngine.getProjectIndicator(p);
              const weights = StorageService.getProjectWeights(p.id);
              const tasks = StorageService.getProjectTasks(p.id);
              const completedTasks = tasks.filter((t) => t.status === 'Selesai').length;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="p-4 sm:p-5 hover:bg-slate-50 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-800 transition truncate max-w-md">
                        {p.nama}
                      </h3>
                      <ProjectStatusBadge status={p.status} />
                      <IndicatorBadge indicator={indicator} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span><strong>Klien:</strong> {p.klien}</span>
                      <span>•</span>
                      <span>{p.lokasi}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Target: {formatDateIndo(p.deadline)}
                      </span>
                    </div>

                    {/* Divisi Breakdown Mini Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {weights.map((dw) => {
                        const dp = ProgressEngine.calculateDivisionProgress(p.id, dw.divisi);
                        return (
                          <span
                            key={dw.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200"
                          >
                            <span>{dw.divisi}:</span>
                            <span className="font-bold text-slate-900">{dp}%</span>
                          </span>
                        );
                      })}
                      <span className="text-[11px] text-slate-400">
                        ({completedTasks}/{tasks.length} task selesai)
                      </span>
                    </div>
                  </div>

                  {/* Right: Progress bar & percentage (Clean responsive width) */}
                  <div className="flex items-center gap-3 w-full md:w-64 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-500">Progres</span>
                        <span className="font-bold text-slate-900">{progress}%</span>
                      </div>
                      <ProgressBar progress={progress} height="md" />
                    </div>
                    <div className="w-7 h-7 rounded bg-slate-100 group-hover:bg-brand-100 group-hover:text-brand-800 text-slate-400 flex items-center justify-center transition shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Project Creation Modal */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
