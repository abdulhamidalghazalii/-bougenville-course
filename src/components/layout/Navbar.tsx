import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Badge } from '../ui/Badge';
import {
  LogOut,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export const Navbar: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const currentUser = store.currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = () => {
    store.logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slateGray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(isAdmin ? '/admin' : '/tutor')}
          >
            <div className="w-10 h-10 rounded-xl bg-navyInk-700 shadow-subtle flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5 text-softBlue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-navyInk-700 tracking-tight">
                  Bougenville Course
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-softBlue text-navyInk-700">
                  Calistung
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slateGray-500 font-medium">
                Belajar Ceria, Tumbuh Penuh Percaya Diri
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
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slateGray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-softBlue text-navyInk-700 font-bold flex items-center justify-center text-xs">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-navyInk-700 line-clamp-1">{currentUser?.full_name}</div>
                  <div className="text-slateGray-400 text-[11px]">{currentUser?.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slateGray-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slateGray-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slateGray-100">
                    <p className="text-xs font-bold text-navyInk-700">{currentUser?.full_name}</p>
                    <p className="text-[11px] text-slateGray-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-softBlue text-navyInk-700">
                      Role: {isAdmin ? 'Administrator' : 'Tutor'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slateGray-700 hover:bg-slateGray-50 flex items-center gap-2 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slateGray-500" />
                      <span>Ubah Kata Sandi</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-slateGray-100 mt-1"
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
