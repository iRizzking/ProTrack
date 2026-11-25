import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storage';
import { Bell, UserCheck, ChevronDown, CheckCheck, RotateCcw, LogOut, Menu } from 'lucide-react';
import { formatDateTimeIndo } from '../../services/exportService';

export const Navbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { currentUser, allUsers, switchUser, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifications = currentUser ? StorageService.getUserNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.sudah_dibaca).length;

  const handleMarkAllRead = () => {
    if (currentUser) {
      StorageService.markAllNotificationsRead(currentUser.id);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset data demo ke pengaturan awal PRD?')) {
      StorageService.resetToDefault();
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16">
        {/* Left: Mobile menu toggle + App Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
              PT
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  ProTrack
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 shrink-0">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden md:block">
                Tracking Progres Proyek Konsultan Konstruksi
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Notifications, User Switcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reset Demo button (Hidden on small mobile to prevent crowding) */}
          <button
            onClick={handleResetData}
            title="Reset data demo ke awal"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Lihat notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
              <div className="absolute right-0 mt-1.5 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-50 text-rose-700 text-[10px] px-1.5 py-0.2 rounded font-bold border border-rose-200">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition hover:bg-slate-50 cursor-pointer ${
                          !n.sudah_dibaca ? 'bg-slate-50/70' : ''
                        }`}
                        onClick={() => StorageService.markNotificationRead(n.id)}
                      >
                        <p className={`leading-relaxed ${!n.sudah_dibaca ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                          {n.pesan}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formatDateTimeIndo(n.waktu)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu & Role */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotif(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition min-w-[44px] min-h-[44px]"
              aria-label="Menu akun"
            >
              <div className="w-7 h-7 rounded bg-brand-800 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {currentUser.nama.substring(0, 2)}
              </div>
              <div className="hidden sm:block text-left max-w-[130px]">
                <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                  {currentUser.nama}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight truncate">
                  {currentUser.role} {currentUser.divisi !== '-' ? `• ${currentUser.divisi}` : ''}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block truncate">{currentUser.nama}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{currentUser.email}</span>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Ganti Akun Demo (Simulasi)
                </div>

                <div className="max-h-56 overflow-y-auto py-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isSelected ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="block truncate">{u.nama}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {u.role} {u.divisi !== '-' ? `• ${u.divisi}` : ''}
                          </span>
                        </div>
                        {isSelected && <UserCheck className="w-3.5 h-3.5 text-brand-800 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-1.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
