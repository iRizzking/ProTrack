import React, { useState } from 'react';
import { Task } from '../../types';
import { StorageService } from '../../services/storage';
import { ProgressEngine } from '../../services/progressEngine';
import { formatDateIndo } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { IndicatorBadge, TaskStatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { UpdateProgressModal } from './UpdateProgressModal';
import {
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Calendar,
  Search,
} from 'lucide-react';

export const MyTasks: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  if (!currentUser) return null;

  const allProjects = StorageService.getProjects();
  // PRD 7.8: Daftar task milik PIC, diurutkan berdasarkan deadline terdekat
  const myTasks = StorageService.getPicTasks(currentUser.id).sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const overdueTasks = myTasks.filter((t) => {
    const now = new Date();
    return now > new Date(t.deadline) && t.progres < 100;
  });

  const inProgressTasks = myTasks.filter((t) => t.status === 'Berjalan' || t.status === 'Review');
  const completedTasks = myTasks.filter((t) => t.status === 'Selesai');

  // Filtered tasks
  const filteredTasks = myTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const proj = allProjects.find((p) => p.id === t.project_id);
      return (
        t.judul.toLowerCase().includes(q) ||
        (proj && proj.nama.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Task Saya ({currentUser.nama})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diurutkan berdasarkan prioritas batas waktu deadline terdekat.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-sm">
            Total: <strong>{myTasks.length}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 shadow-sm">
            Berjalan: <strong>{inProgressTasks.length}</strong>
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 shadow-sm">
            Selesai: <strong>{completedTasks.length}</strong>
          </span>
        </div>
      </div>

      {/* Overdue Alert banner if any */}
      {overdueTasks.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Perhatian: {overdueTasks.length} task Anda melewati target deadline!
            </span>
            <p className="text-rose-700">
              Segera perbarui progres atau sampaikan kendala pada catatan agar terpantau oleh Owner.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Responsive, no crowding) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari task pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none w-full min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Belum Mulai', 'Berjalan', 'Review', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 min-h-[38px] ${
                statusFilter === st
                  ? 'bg-brand-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Tidak ada task yang sesuai dengan filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const project = allProjects.find((p) => p.id === task.project_id);
            const ind = ProgressEngine.getTaskIndicator(task);

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between space-y-3.5 ${
                  ind.color === 'red' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  {/* Project name & Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]">
                      {project?.nama || 'Proyek'}
                    </span>
                    <IndicatorBadge indicator={ind} />
                  </div>

                  {/* Task title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {task.judul}
                  </h3>

                  {task.deskripsi && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {task.deskripsi}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {formatDateIndo(task.deadline)}
                    </span>
                    <span>Bobot: <strong>{task.bobot}%</strong></span>
                    <TaskStatusBadge status={task.status} />
                  </div>

                  {task.doc_link && (
                    <a
                      href={task.doc_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand-700 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Buka Dokumen Desain
                    </a>
                  )}

                  {task.catatan && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 italic">
                      "{task.catatan}"
                    </div>
                  )}
                </div>

                {/* Progress bar & Quick 1-Click Update Button */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Progres Saya</span>
                    <span className="font-bold text-slate-900">{task.progres}%</span>
                  </div>
                  <ProgressBar progress={task.progres} height="sm" />

                  <button
                    onClick={() => setSelectedTask(task)}
                    className="w-full mt-1.5 py-2.5 px-4 rounded-lg bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <span>Update Progres & Catatan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Update Progres */}
      {selectedTask && (
        <UpdateProgressModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
