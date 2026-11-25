import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo accounts for fast testing
  const demoAccounts = [
    {
      role: 'Owner',
      name: 'Ir. Hendra Kusuma',
      divisi: 'Pimpinan Biro',
      email: 'owner@protrack.id',
      pass: 'owner123',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      role: 'Admin',
      name: 'Sari Wulandari, S.Kom',
      divisi: 'Divisi Admin',
      email: 'admin@protrack.id',
      pass: 'admin123',
      badgeColor: 'bg-purple-100 text-purple-900',
    },
    {
      role: 'PIC Arsitek',
      name: 'Bagus Pratama, S.Ars',
      divisi: 'Divisi Arsitek',
      email: 'bagus.arsitek@protrack.id',
      pass: 'pic123',
      badgeColor: 'bg-blue-100 text-blue-900',
    },
    {
      role: 'PIC Struktur',
      name: 'Ir. Ahmad Zarkasih, MT',
      divisi: 'Divisi Struktur',
      email: 'ahmad.struktur@protrack.id',
      pass: 'pic123',
      badgeColor: 'bg-amber-100 text-amber-950',
    },
    {
      role: 'PIC MEP',
      name: 'Rian Firmansyah, ST',
      divisi: 'Divisi MEP',
      email: 'rian.mep@protrack.id',
      pass: 'pic123',
      badgeColor: 'bg-teal-100 text-teal-900',
    },
  ];

  const handleQuickFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setErrorMsg(result.message || 'Login gagal');
        setLoading(false);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-800 text-white font-bold text-xl shadow-md">
            PT
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ProTrack
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aplikasi Tracking Progres Proyek Biro Konsultan Konstruksi
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-5 sm:p-7 shadow-lg border border-slate-200 space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan email & password Anda untuk mengakses data proyek.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="nama@protrack.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none transition min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-700 outline-none transition min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-slate-400 hover:text-slate-600 absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-800 hover:bg-brand-900 active:bg-brand-950 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 min-h-[44px] disabled:opacity-50"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke ProTrack'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pilihan Akun Demo (Klik untuk Isi Otomatis):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 rounded-lg border border-slate-200 text-left transition hover:border-brand-700 hover:bg-slate-50 flex items-center justify-between min-h-[44px]"
                >
                  <div className="truncate pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {acc.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {acc.email}
                    </span>
                  </div>
                  <span className="text-[10px] text-brand-700 font-bold shrink-0">Pilih</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          ProTrack v1.0 • Biro Konsultan Konstruksi
        </p>
      </div>
    </div>
  );
};
