import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  UserCircle,
  LogOut,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const currentUser = store.currentUser;
  const isAdmin = currentUser?.role === 'admin';

  const handleSwitchAccount = (role: 'admin' | 'tutor', specificTutorId?: string) => {
    store.switchRole(role, specificTutorId);
    setShowSwitchModal(false);
    setShowUserMenu(false);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/tutor');
    }
  };

  const handleLogout = () => {
    store.logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slateNavy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(isAdmin ? '/admin' : '/tutor')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-400 p-2 shadow-md shadow-brand-500/20 flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slateNavy-900 tracking-tight">Syafa Course</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-pastelPink-100 text-pastelPink-700 text-[10px] font-bold">
                  Calistung
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slateNavy-500 font-medium">Belajar Ceria, Tumbuh Bersama</p>
            </div>
          </div>

          {/* Right Action: Role Badge & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Switcher Button */}
            <button
              onClick={() => setShowSwitchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
              title="Ganti akun untuk demonstrasi role"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Ganti Akun Demo</span>
              <span className="sm:hidden">Akun</span>
            </button>

            {/* Current Role Badge */}
            <Badge variant={isAdmin ? 'purple' : 'blue'} icon={isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}>
              {isAdmin ? 'Admin' : 'Tutor'}
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

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSwitchModal(true);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slateNavy-700 hover:bg-cream-100 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Ubah Akun (Admin / Tutor)</span>
                  </button>

                  <div className="border-t border-slateNavy-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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

      {/* Switch Role / Account Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slateNavy-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slateNavy-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slateNavy-900">Ubah Akun Pengguna</h3>
                <p className="text-xs text-slateNavy-500">Uji skenario hak akses Admin vs Tutor & isolasi data</p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              {/* Option: Admin */}
              <div
                onClick={() => handleSwitchAccount('admin')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isAdmin
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-400/30'
                    : 'border-slateNavy-200 hover:border-brand-300 hover:bg-slateNavy-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slateNavy-900">Sarah Rahmawati (Admin Pusat)</div>
                    <div className="text-xs text-slateNavy-500">Kelola akun tutor, tidak ada akses data siswa</div>
                  </div>
                </div>
                {isAdmin && <span className="text-xs font-bold text-brand-600">Aktif</span>}
              </div>

              {/* Option: Tutor Aisyah */}
              <div
                onClick={() => handleSwitchAccount('tutor', 'usr-tutor-01')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentUser?.id === 'usr-tutor-01'
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-400/30'
                    : 'border-slateNavy-200 hover:border-brand-300 hover:bg-slateNavy-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slateNavy-900">Kak Aisyah (Tutor PAUD & TK)</div>
                    <div className="text-xs text-slateNavy-500">Mengajar Kenzo & Alika, evaluasi calistung</div>
                  </div>
                </div>
                {currentUser?.id === 'usr-tutor-01' && <span className="text-xs font-bold text-brand-600">Aktif</span>}
              </div>

              {/* Option: Tutor Budi */}
              <div
                onClick={() => handleSwitchAccount('tutor', 'usr-tutor-02')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  currentUser?.id === 'usr-tutor-02'
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-400/30'
                    : 'border-slateNavy-200 hover:border-brand-300 hover:bg-slateNavy-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slateNavy-900">Kak Budi (Tutor SD 1-3)</div>
                    <div className="text-xs text-slateNavy-500">Mengajar Fathan, data terisolasi dari Tutor Aisyah</div>
                  </div>
                </div>
                {currentUser?.id === 'usr-tutor-02' && <span className="text-xs font-bold text-brand-600">Aktif</span>}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSwitchModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
