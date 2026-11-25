import React, { useState } from 'react';
import { Project, Task, Division, TaskStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { ProgressEngine } from '../../services/progressEngine';
import { ExportService, formatDateIndo } from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import { IndicatorBadge, ProjectStatusBadge, TaskStatusBadge, DivisionBadge } from '../common/StatusBadge';
import { ProgressBar } from '../common/ProgressBar';
import { TaskModal } from '../tasks/TaskModal';
import { UpdateProgressModal } from '../tasks/UpdateProgressModal';
import {
  ArrowLeft,
  Plus,
  FileText,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  BarChart3,
  Layers,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const { currentUser, isAdmin, isPIC, canManageTasks } = useAuth();
  const project = StorageService.getProject(projectId);

  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterPic, setFilterPic] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [updatingTask, setUpdatingTask] = useState<Task | null>(null);

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">Proyek tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-brand-800 text-white rounded-lg text-xs font-semibold"
        >
          Kembali ke Daftar Proyek
        </button>
      </div>
    );
  }

  const overallProgress = ProgressEngine.calculateProjectProgress(project.id);
  const projectIndicator = ProgressEngine.getProjectIndicator(project);
  const divisionWeights = StorageService.getProjectWeights(project.id);
  const allTasks = StorageService.getProjectTasks(project.id);
  const allUsers = StorageService.getUsers();

  // Division chart data for Recharts
  const chartData = divisionWeights.map((dw) => {
    const prog = ProgressEngine.calculateDivisionProgress(project.id, dw.divisi);
    return {
      name: dw.divisi,
      progres: prog,
      bobot: dw.bobot,
    };
  });

  const getDivisionColor = (div: string) => {
    if (div === 'Arsitek') return '#2563eb'; // Blue
    if (div === 'Struktur') return '#d97706'; // Amber
    if (div === 'MEP') return '#0d9488'; // Teal
    return '#64748b';
  };

  // PIC breakdown calculations
  const assignedPics = Array.from(new Set(allTasks.map((t) => t.pic_id)))
    .map((id) => allUsers.find((u) => u.id === id))
    .filter(Boolean);

  const picStats = assignedPics.map((pic) => {
    const pTasks = allTasks.filter((t) => t.pic_id === pic!.id);
    const completed = pTasks.filter((t) => t.status === 'Selesai').length;
    const prog = ProgressEngine.calculatePICProgress(project.id, pic!.id);
    return {
      pic: pic!,
      totalTasks: pTasks.length,
      completedTasks: completed,
      progress: prog,
    };
  });

  // Filter tasks
  const filteredTasks = allTasks.filter((t) => {
    if (filterDivision !== 'all' && t.divisi !== filterDivision) return false;
    if (filterPic !== 'all' && t.pic_id !== filterPic) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.judul.toLowerCase().includes(q) ||
        (t.deskripsi && t.deskripsi.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Hapus task pekerjaan ini?')) {
      StorageService.deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-900 transition self-start min-h-[44px] py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Proyek</span>
        </button>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => ExportService.exportProjectToPDF(project.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition min-h-[40px]"
            title="Download Laporan PDF"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Ekspor PDF</span>
          </button>
          <button
            onClick={() => ExportService.exportProjectToExcel(project.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition min-h-[40px]"
            title="Download File Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Project Banner & Big Progress Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-center">
          {/* Left: Project Specs */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <ProjectStatusBadge status={project.status} />
              <IndicatorBadge indicator={projectIndicator} showDescription />
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
              {project.nama}
            </h1>

            {project.deskripsi && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {project.deskripsi}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div>
                <span className="font-semibold text-slate-700">Klien:</span> {project.klien}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Lokasi:</span> {project.lokasi}
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {formatDateIndo(project.tanggal_mulai)} s/d {formatDateIndo(project.deadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Big Progress Display */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Progres Keseluruhan Proyek
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-4xl sm:text-5xl font-black text-brand-900 tracking-tight">
                {overallProgress}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-brand-700">%</span>
            </div>
            <div className="w-full max-w-[200px] mt-1.5">
              <ProgressBar progress={overallProgress} height="lg" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5">
              Rata-rata tertimbang bobot divisi
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown per Divisi & Breakdown per PIC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Division Breakdown Chart & Cards */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-800" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Breakdown Progres per Divisi
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Total Bobot 100%</span>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val}% (Bobot Proyek: ${item.payload.bobot}%)`,
                    'Realisasi',
                  ]}
                />
                <Bar dataKey="progres" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDivisionColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Division detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {divisionWeights.map((dw) => {
              const prog = ProgressEngine.calculateDivisionProgress(project.id, dw.divisi);
              return (
                <div key={dw.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{dw.divisi}</span>
                    <span className="text-[10px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-500 font-semibold">
                      {dw.bobot}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-900">{prog}</span>
                    <span className="text-xs font-semibold text-slate-500">%</span>
                  </div>
                  <ProgressBar progress={prog} height="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* PIC Breakdown Table */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-800" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Kontribusi & Beban Kerja PIC
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">{picStats.length} PIC Terlibat</span>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-2">Nama PIC</th>
                    <th className="pb-2">Divisi</th>
                    <th className="pb-2 text-center">Selesai</th>
                    <th className="pb-2 text-right">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {picStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Belum ada PIC yang di-assign.
                      </td>
                    </tr>
                  ) : (
                    picStats.map((item) => (
                      <tr key={item.pic.id} className="hover:bg-slate-50 transition">
                        <td className="py-2 font-bold text-slate-800">
                          {item.pic.nama}
                        </td>
                        <td className="py-2">
                          <DivisionBadge division={item.pic.divisi} />
                        </td>
                        <td className="py-2 text-center">
                          <span className="font-semibold text-slate-700">
                            {item.completedTasks} / {item.totalTasks}
                          </span>
                        </td>
                        <td className="py-2 text-right w-28 sm:w-36">
                          <div className="flex items-center justify-end gap-1.5">
                            <ProgressBar progress={item.progress} height="sm" />
                            <span className="font-bold text-slate-800 min-w-[28px] text-right">
                              {item.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Task Management Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Daftar Task Proyek ({filteredTasks.length})
            </h3>
            {canManageTasks && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-lg shadow-sm transition min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Task</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none w-full sm:w-36 min-h-[38px]"
              />
            </div>

            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none bg-white font-medium min-h-[38px]"
            >
              <option value="all">Semua Divisi</option>
              <option value="Arsitek">Arsitek</option>
              <option value="Struktur">Struktur</option>
              <option value="MEP">MEP</option>
            </select>

            <select
              value={filterPic}
              onChange={(e) => setFilterPic(e.target.value)}
              className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none bg-white font-medium min-h-[38px]"
            >
              <option value="all">Semua PIC</option>
              {assignedPics.map((p) => (
                <option key={p!.id} value={p!.id}>
                  {p!.nama}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none bg-white font-medium min-h-[38px]"
            >
              <option value="all">Semua Status</option>
              <option value="Belum Mulai">Belum Mulai</option>
              <option value="Berjalan">Berjalan</option>
              <option value="Review">Review</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Task List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Uraian Pekerjaan</th>
                <th className="py-2.5 px-2.5">Divisi</th>
                <th className="py-2.5 px-2.5">PIC</th>
                <th className="py-2.5 px-2 text-center">Bobot</th>
                <th className="py-2.5 px-2.5">Deadline</th>
                <th className="py-2.5 px-2.5">Status</th>
                <th className="py-2.5 px-3 text-center">Progres</th>
                <th className="py-2.5 px-2.5">Kondisi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Tidak ada task yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const pic = allUsers.find((u) => u.id === t.pic_id);
                  const ind = ProgressEngine.getTaskIndicator(t);
                  const canUpdateProgress =
                    isAdmin || (isPIC && t.pic_id === currentUser?.id);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 leading-snug">
                          {t.judul}
                        </div>
                        {t.deskripsi && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {t.deskripsi}
                          </p>
                        )}
                        {t.doc_link && (
                          <a
                            href={t.doc_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-700 hover:underline mt-0.5 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Dokumen Gambar
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-2.5">
                        <DivisionBadge division={t.divisi} />
                      </td>
                      <td className="py-3 px-2.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {pic?.nama || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-700">
                        {t.bobot}%
                      </td>
                      <td className="py-3 px-2.5 text-slate-600 font-medium whitespace-nowrap">
                        {formatDateIndo(t.deadline)}
                      </td>
                      <td className="py-3 px-2.5">
                        <TaskStatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-3 w-32">
                        <div className="flex items-center gap-1.5">
                          <ProgressBar progress={t.progres} height="sm" />
                          <span className="font-bold text-slate-800 text-xs min-w-[28px] text-right">
                            {t.progres}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2.5">
                        <IndicatorBadge indicator={ind} />
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdateProgress && (
                            <button
                              onClick={() => setUpdatingTask(t)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs transition"
                              title="Update Progres & Catatan"
                            >
                              Update
                            </button>
                          )}

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingTask(t);
                                  setShowTaskModal(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-slate-700"
                                title="Edit Detail Task"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600"
                                title="Hapus Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskModal
          projectId={project.id}
          task={editingTask}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Quick Progress Update Modal */}
      {updatingTask && (
        <UpdateProgressModal
          task={updatingTask}
          onClose={() => setUpdatingTask(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
