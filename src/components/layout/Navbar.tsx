import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Badge } from '../ui/Badge';
import {
  LogOut,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUser = store.currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    store.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slateNavy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(isAdmin ? '/admin' : '/tutor')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-400 p-2 shadow-md shadow-brand-500/20 flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slateNavy-900 tracking-tight">
                Syafa Course
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-pastelPink-100 text-pastelPink-700 text-[10px] font-bold">
                Calistung
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slateNavy-500 font-medium">
              Belajar Ceria, Tumbuh Bersama
            </p>
          </div>
        </div>

        {/* Right Action: Role Badge & Profile */}
        <div className="flex items-center gap-3">
          {/* Current Role Badge */}
          <Badge
            variant={isAdmin ? 'purple' : 'blue'}
            icon={isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
          >
            {isAdmin ? 'Administrator' : 'Tutor'}
          </Badge>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slateNavy-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slateNavy-800 line-clamp-1">{currentUser?.full_name}</div>
                <div className="text-slateNavy-400 text-[11px]">{currentUser?.email}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slateNavy-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slateNavy-100 shadow-float py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slateNavy-100">
                  <p className="text-xs font-bold text-slateNavy-900">{currentUser?.full_name}</p>
                  <p className="text-[11px] text-slateNavy-500 truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-brand-600 font-semibold mt-1 uppercase tracking-wider">
                    Role: {currentUser?.role}
                  </p>
                </div>

                <div className="mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar (Logout)</span>
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
