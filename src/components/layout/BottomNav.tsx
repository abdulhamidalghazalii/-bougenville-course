import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpenCheck,
  FileText,
  UserCog,
  History,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const store = useAppStore();
  const currentUser = store.currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const tutorItems = [
    { to: '/tutor', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/tutor/students', label: 'Siswa', icon: Users },
    { to: '/tutor/schedules', label: 'Jadwal', icon: CalendarDays },
    { to: '/tutor/sessions', label: 'Sesi', icon: BookOpenCheck },
    { to: '/tutor/reports', label: 'Laporan', icon: FileText },
  ];

  const adminItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/tutors', label: 'Akun Tutor', icon: UserCog },
    { to: '/admin/audit', label: 'Audit Log', icon: History },
  ];

  const items = isAdmin ? adminItems : tutorItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slateNavy-100 px-2 py-1.5 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slateNavy-500 hover:text-slateNavy-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
