import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, X, LogOut } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { currentUser, isOwner, isPIC, logout } = useAuth();

  if (!currentUser) return null;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Owner', 'Admin'],
      badge: isOwner ? 'Utama' : undefined,
    },
    {
      id: 'projects',
      label: isPIC ? 'Proyek Saya' : 'Daftar Proyek',
      icon: FolderKanban,
      roles: ['Owner', 'Admin', 'PIC'],
    },
    {
      id: 'my-tasks',
      label: 'Task Saya',
      icon: CheckSquare,
      roles: ['PIC', 'Admin'],
      highlight: isPIC,
    },
    {
      id: 'users',
      label: 'Kelola Pengguna',
      icon: Users,
      roles: ['Admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header inside sidebar for mobile */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-brand-700 flex items-center justify-center font-bold text-white text-xs">
                PT
              </div>
              <span className="font-bold text-base text-white">ProTrack</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 block">
              Menu Navigasi
            </span>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition min-h-[44px] ${
                    isActive
                      ? 'bg-brand-800 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info card in sidebar */}
        <div className="p-3 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-lg p-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {currentUser.nama.substring(0, 2)}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.nama}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                {currentUser.role} {currentUser.divisi !== '-' ? `• ${currentUser.divisi}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-semibold transition min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
