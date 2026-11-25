import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ProgressEngine } from '../../services/progressEngine';
import { formatDateIndo } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { IndicatorBadge, ProjectStatusBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { ProjectModal } from './ProjectModal';
import {
  Plus,
  Calendar,
  ChevronRight,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const { currentUser, isAdmin, isPIC } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allProjects = StorageService.getProjects();

  // If PIC, only list projects where they have assigned tasks
  const userProjects = isPIC && currentUser
    ? allProjects.filter((p) => {
        const pTasks = StorageService.getProjectTasks(p.id);
        return pTasks.some((t) => t.pic_id === currentUser.id);
      })
    : allProjects;

  const filtered = userProjects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Hapus proyek ini beserta seluruh data pembobotan dan task?')) {
      StorageService.deleteProject(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    setEditingProject(p);
    setShowModal(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isPIC ? 'Proyek Penugasan Saya' : 'Daftar Seluruh Proyek'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPIC
              ? 'Daftar proyek konstruksi di mana Anda ditugaskan sebagai PIC.'
              : 'Kelola seluruh portofolio proyek perencanaan konstruksi biro konsultan.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingProject(null);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-lg shadow-sm transition self-start sm:self-auto min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama proyek, klien, lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none w-full min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Aktif', 'On Hold', 'Selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 min-h-[38px] ${
                statusFilter === st
                  ? 'bg-brand-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            Tidak ada proyek yang ditemukan.
          </div>
        ) : (
          filtered.map((p) => {
            const prog = ProgressEngine.calculateProjectProgress(p.id);
            const ind = ProgressEngine.getProjectIndicator(p);
            const weights = StorageService.getProjectWeights(p.id);
            const tasks = StorageService.getProjectTasks(p.id);
            const completed = tasks.filter((t) => t.status === 'Selesai').length;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-slate-400 transition cursor-pointer flex flex-col justify-between space-y-3.5 group"
              >
                <div className="space-y-2.5">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2">
                    <ProjectStatusBadge status={p.status} />
                    <IndicatorBadge indicator={ind} />
                  </div>

                  {/* Title & Client */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-800 transition line-clamp-1">
                      {p.nama}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {p.klien} • {p.lokasi}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {formatDateIndo(p.deadline)}</span>
                  </div>

                  {/* Division weights & progress summary */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Divisi</span>
                      <span>Realisasi</span>
                    </div>
                    {weights.map((dw) => {
                      const dp = ProgressEngine.calculateDivisionProgress(p.id, dw.divisi);
                      return (
                        <div key={dw.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">
                            {dw.divisi} ({dw.bobot}%)
                          </span>
                          <span className="font-bold text-slate-900">{dp}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Progress & Actions */}
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Total Progres</span>
                    <span className="font-bold text-slate-900">{prog}%</span>
                  </div>
                  <ProgressBar progress={prog} height="md" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {completed}/{tasks.length} task selesai
                    </span>

                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleEdit(e, p)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-700 min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Edit Proyek"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, p.id)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <div className="w-6 h-6 rounded bg-slate-100 group-hover:bg-brand-100 group-hover:text-brand-800 text-slate-400 flex items-center justify-center transition">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Project */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
