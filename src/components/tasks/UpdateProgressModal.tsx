import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { X, Send, History, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDateTimeIndo } from '../../services/exportService';

interface UpdateProgressModalProps {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({ task, onClose, onSuccess }) => {
  const { currentUser, isOwner } = useAuth();
  const [progress, setProgress] = useState<number>(task.progres);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [notes, setNotes] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'update' | 'history' | 'comments'>('update');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const logs = StorageService.getTaskLogs(task.id);
  const comments = StorageService.getTaskComments(task.id);

  // Synchronize status and progress according to PRD
  const handleProgressChange = (val: number) => {
    setProgress(val);
    if (val === 100) {
      setStatus('Selesai');
    } else if (val > 0 && status === 'Belum Mulai') {
      setStatus('Berjalan');
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Selesai') {
      setProgress(100);
    }
  };

  const handleSubmitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg('Harap berikan catatan singkat mengenai progres yang dicapai.');
      return;
    }

    try {
      StorageService.updateTaskProgress({
        taskId: task.id,
        newProgress: progress,
        notes: notes.trim(),
        currentUser,
        newStatus: status,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui progres');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    StorageService.addComment({
      taskId: task.id,
      isi: commentText.trim(),
      user: currentUser,
    });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              {task.divisi} • Bobot {task.bobot}%
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
              {task.judul}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('update')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'update'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Update Progres
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Log ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Komentar ({comments.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'update' && (
            <form onSubmit={handleSubmitUpdate} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Slider & Input Angka per PRD 7.4 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Persentase Progres Realisasi
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => handleProgressChange(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-16 px-2 py-1 text-right text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                    <span className="text-sm font-bold text-slate-600">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => handleProgressChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />

                {/* Quick select buttons */}
                <div className="grid grid-cols-5 gap-1.5 mt-3">
                  {[0, 25, 50, 75, 100].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleProgressChange(step)}
                      className={`py-1 text-xs font-semibold rounded-lg border transition ${
                        progress === step
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {step}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Task */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Pekerjaan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Belum Mulai', 'Berjalan', 'Review', 'Selesai'] as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition ${
                        status === st
                          ? 'bg-brand-50 text-brand-800 border-brand-300 ring-2 ring-brand-500/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                {status === 'Selesai' && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status Selesai otomatis menetapkan progres 100% sesuai PRD.
                  </p>
                )}
              </div>

              {/* Catatan / Audit Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Progres <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Perhitungan penulangan pile cap rampung, siap diasistensikan ke owner..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Catatan ini akan tersimpan permanen di Log Audit Progres.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 rounded-xl shadow-md transition"
                >
                  Simpan Progres
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  Belum ada catatan riwayat pembaruan progres pada task ini.
                </p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-800">{log.user_nama}</span>
                      <span className="text-[11px]">{formatDateTimeIndo(log.waktu)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-600">{log.progres_lama}%</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {log.progres_baru}%
                      </span>
                    </div>
                    <p className="text-slate-700 pt-1 leading-relaxed bg-white p-2 rounded border border-slate-100">
                      "{log.catatan}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    Belum ada komentar atau diskusi di task ini.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs ${
                        c.user_role === 'Owner'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{c.user_nama}</span>
                          <span
                            className={`text-[10px] px-1.5 rounded font-bold ${
                              c.user_role === 'Owner'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {c.user_role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTimeIndo(c.waktu)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.isi}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Form Tambah Komentar */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Tulis tanggapan atau instruksi..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-brand-800 text-white rounded-xl hover:bg-brand-900 transition flex items-center gap-1 text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
