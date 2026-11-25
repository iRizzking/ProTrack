import React, { useState } from 'react';
import { Project, Division } from '../../types';
import { StorageService } from '../../services/storage';
import { PROJECT_TEMPLATES, ProjectTemplate } from '../../services/templateService';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSuccess }) => {
  const isEdit = !!project;

  const [nama, setNama] = useState(project?.nama || '');
  const [klien, setKlien] = useState(project?.klien || '');
  const [lokasi, setLokasi] = useState(project?.lokasi || '');
  const [tanggalMulai, setTanggalMulai] = useState(
    project?.tanggal_mulai || new Date().toISOString().split('T')[0]
  );
  const [deadline, setDeadline] = useState(
    project?.deadline || new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState(project?.status || 'Aktif');
  const [deskripsi, setDeskripsi] = useState(project?.deskripsi || '');

  // Bobot Divisi (PRD 7.2: Total wajib 100%)
  const initialWeights = isEdit
    ? StorageService.getProjectWeights(project.id)
    : [
        { divisi: 'Arsitek' as Division, bobot: 40 },
        { divisi: 'Struktur' as Division, bobot: 35 },
        { divisi: 'MEP' as Division, bobot: 25 },
      ];

  const [weightArsitek, setWeightArsitek] = useState<number>(
    initialWeights.find((w) => w.divisi === 'Arsitek')?.bobot || 40
  );
  const [weightStruktur, setWeightStruktur] = useState<number>(
    initialWeights.find((w) => w.divisi === 'Struktur')?.bobot || 35
  );
  const [weightMep, setWeightMep] = useState<number>(
    initialWeights.find((w) => w.divisi === 'MEP')?.bobot || 25
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  const totalWeight = weightArsitek + weightStruktur + weightMep;

  // Handle template selection
  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;
    const tmpl = PROJECT_TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;

    if (!nama) setNama(tmpl.nama);
    if (!deskripsi) setDeskripsi(tmpl.deskripsi);

    const ars = tmpl.defaultWeights.find((w) => w.divisi === 'Arsitek')?.bobot || 40;
    const str = tmpl.defaultWeights.find((w) => w.divisi === 'Struktur')?.bobot || 35;
    const mep = tmpl.defaultWeights.find((w) => w.divisi === 'MEP')?.bobot || 25;

    setWeightArsitek(ars);
    setWeightStruktur(str);
    setWeightMep(mep);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !klien.trim()) {
      setErrorMsg('Nama proyek dan klien wajib diisi.');
      return;
    }

    if (totalWeight !== 100) {
      setErrorMsg(`Total bobot divisi harus tepat 100% (saat ini ${totalWeight}%).`);
      return;
    }

    try {
      const savedProj = StorageService.saveProject({
        id: project?.id,
        nama: nama.trim(),
        klien: klien.trim(),
        lokasi: lokasi.trim(),
        tanggal_mulai: tanggalMulai,
        deadline,
        status: status as any,
        deskripsi: deskripsi.trim(),
      });

      // Save division weights
      StorageService.setProjectWeights(savedProj.id, [
        { divisi: 'Arsitek', bobot: weightArsitek },
        { divisi: 'Struktur', bobot: weightStruktur },
        { divisi: 'MEP', bobot: weightMep },
      ]);

      // If new project from template, generate template tasks automatically!
      if (!isEdit && selectedTemplateId) {
        const tmpl = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);
        if (tmpl) {
          const allUsers = StorageService.getUsers().filter((u) => u.aktif);
          const arsUser = allUsers.find((u) => u.divisi === 'Arsitek') || allUsers[0];
          const strUser = allUsers.find((u) => u.divisi === 'Struktur') || allUsers[0];
          const mepUser = allUsers.find((u) => u.divisi === 'MEP') || allUsers[0];

          tmpl.tasks.forEach((item) => {
            let picId = arsUser.id;
            if (item.divisi === 'Struktur') picId = strUser.id;
            else if (item.divisi === 'MEP') picId = mepUser.id;

            const taskDeadline = new Date(
              new Date(tanggalMulai).getTime() + item.durasiHari * 86400000
            ).toISOString().split('T')[0];

            StorageService.saveTask({
              project_id: savedProj.id,
              divisi: item.divisi,
              pic_id: picId,
              judul: item.judul,
              deskripsi: item.deskripsi,
              bobot: item.bobot,
              tanggal_mulai: tanggalMulai,
              deadline: taskDeadline,
              status: 'Belum Mulai',
              progres: 0,
            });
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan proyek');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? 'Edit Data Proyek' : 'Buat Proyek Baru'}
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
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Template Selector (P1 PRD) */}
          {!isEdit && (
            <div className="p-3.5 bg-brand-50/70 border border-brand-200 rounded-xl">
              <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-brand-700" />
                Gunakan Template Proyek (P1)
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyTemplate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-brand-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
              >
                <option value="">-- Proyek Kosong (Input Manual) --</option>
                {PROJECT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-brand-700 mt-1">
                Otomatis mengisi bobot divisi dan daftar task standar per divisi konsultan.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Proyek <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gedung Kantor PT Maju Jaya 8 Lantai"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Klien <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PT Maju Jaya"
                value={klien}
                onChange={(e) => setKlien(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Proyek</label>
              <input
                type="text"
                placeholder="Contoh: Jakarta Selatan"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status Proyek</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
              <option value="Aktif">Aktif</option>
              <option value="On Hold">On Hold</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Ruang Lingkup</label>
            <textarea
              rows={2}
              placeholder="Rangkuman perencanaan teknis, dokumen DED, estimasi anggaran (BQ), dan spesifikasi..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Bobot Divisi per PRD 7.2 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pembobotan Divisi (Wajib Total 100%)
              </label>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  totalWeight === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Total: {totalWeight}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Arsitek (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weightArsitek}
                  onChange={(e) => setWeightArsitek(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Struktur (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weightStruktur}
                  onChange={(e) => setWeightStruktur(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">MEP (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weightMep}
                  onChange={(e) => setWeightMep(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
            {totalWeight !== 100 && (
              <p className="text-[11px] text-rose-600 mt-1.5 font-medium">
                * Sesuaikan angka bobot hingga jumlah total bernilai tepat 100%.
              </p>
            )}
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
              disabled={totalWeight !== 100}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-800 hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition"
            >
              {isEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
