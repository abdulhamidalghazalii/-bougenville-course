import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpenCheck,
  TrendingUp,
  FileText,
  UserCog,
  ShieldCheck,
  History,
  Target,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const isAdmin = currentUser?.role === 'admin';

  // Navigation Items
  const tutorNavItems = [
    { to: '/tutor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/tutor/students', label: 'Data Siswa & Wali', icon: Users },
    { to: '/tutor/programs', label: 'Program & Target', icon: Target },
    { to: '/tutor/schedules', label: 'Jadwal & Kehadiran', icon: CalendarDays },
    { to: '/tutor/sessions', label: 'Monitoring Calistung', icon: BookOpenCheck },
    { to: '/tutor/progress', label: 'Grafik Perkembangan', icon: TrendingUp },
    { to: '/tutor/reports', label: 'Rapor Bulanan & WA', icon: FileText },
  ];

  const adminNavItems = [
    { to: '/admin', label: 'Dashboard Akun', icon: LayoutDashboard, end: true },
    { to: '/admin/tutors', label: 'Kelola Akun Tutor', icon: UserCog },
    { to: '/admin/audit', label: 'Log Aktivitas Akun', icon: History },
  ];

  const navItems = isAdmin ? adminNavItems : tutorNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slateNavy-100 min-h-[calc(100vh-4rem)] p-4">
      {/* Role Notice Card */}
      <div className={`p-3.5 rounded-2xl mb-4 border ${isAdmin ? 'bg-purple-50/70 border-purple-100 text-purple-900' : 'bg-brand-50/70 border-brand-100 text-brand-900'}`}>
        <div className="flex items-center gap-2">
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" /> : <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isAdmin ? 'Portal Admin' : 'Portal Tutor'}
          </span>
        </div>
        <p className="text-[11px] mt-1 text-slateNavy-600 line-clamp-2">
          {isAdmin
            ? 'Pengelolaan kredensial akun tutor dan hak akses sistem.'
            : 'Pengelolaan operasional les & evaluasi calistung anak.'}
        </p>
      </div>

      {/* Nav Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'text-slateNavy-600 hover:bg-cream-100 hover:text-slateNavy-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 mt-auto border-t border-slateNavy-100 text-center">
        <p className="text-[11px] text-slateNavy-400 font-medium">Syafa Course v1.0 • Calistung</p>
        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Database & RLS Terisolasi</p>
      </div>
    </aside>
  );
};
