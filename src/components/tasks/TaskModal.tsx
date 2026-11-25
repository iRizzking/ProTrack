import React, { useState } from 'react';
import { Task, Division, TaskStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { X, Link2 } from 'lucide-react';

interface TaskModalProps {
  projectId: string;
  task?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ projectId, task, onClose, onSuccess }) => {
  const isEdit = !!task;
  const users = StorageService.getUsers().filter((u) => u.aktif && (u.role === 'PIC' || u.role === 'Admin'));

  const [judul, setJudul] = useState(task?.judul || '');
  const [deskripsi, setDeskripsi] = useState(task?.deskripsi || '');
  const [divisi, setDivisi] = useState<Division>(task?.divisi || 'Arsitek');
  const [picId, setPicId] = useState(task?.pic_id || users[0]?.id || '');
  const [bobot, setBobot] = useState<number>(task?.bobot || 25);
  const [tanggalMulai, setTanggalMulai] = useState(
    task?.tanggal_mulai || new Date().toISOString().split('T')[0]
  );
  const [deadline, setDeadline] = useState(
    task?.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Belum Mulai');
  const [progres, setProgres] = useState<number>(task?.progres || 0);
  const [docLink, setDocLink] = useState(task?.doc_link || '');
  const [catatan, setCatatan] = useState(task?.catatan || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      setErrorMsg('Judul task wajib diisi');
      return;
    }
    if (bobot <= 0) {
      setErrorMsg('Bobot task minimal 1%');
      return;
    }

    try {
      StorageService.saveTask({
        id: task?.id,
        project_id: projectId,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        divisi,
        pic_id: picId,
        bobot,
        tanggal_mulai: tanggalMulai,
        deadline,
        status,
        progres,
        doc_link: docLink.trim(),
        catatan: catatan.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? 'Edit Task Pekerjaan' : 'Tambah Task Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Task <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gambar Detail Struktur Pondasi Bored Pile"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ringkas</label>
            <textarea
              rows={2}
              placeholder="Rincian lingkup gambar atau dokumen teknis yang harus diselesaikan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Terkait</label>
              <select
                value={divisi}
                onChange={(e) => setDivisi(e.target.value as Division)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="Arsitek">Arsitek</option>
                <option value="Struktur">Struktur</option>
                <option value="MEP">MEP</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PIC Penanggung Jawab</label>
              <select
                value={picId}
                onChange={(e) => setPicId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.divisi})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bobot Task (%) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tgl Mulai</label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as TaskStatus;
                  setStatus(s);
                  if (s === 'Selesai') setProgres(100);
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="Belum Mulai">Belum Mulai</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Review">Review</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Progres (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={progres}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setProgres(p);
                  if (p === 100) setStatus('Selesai');
                }}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5" />
              Link Dokumen / Gambar Eksternal (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={docLink}
              onChange={(e) => setDocLink(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
              {isEdit ? 'Simpan Perubahan' : 'Buat Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
