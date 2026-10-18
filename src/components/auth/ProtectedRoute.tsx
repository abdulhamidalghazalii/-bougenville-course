import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { UserRole } from '../../types';
import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const store = useAppStore();
  const currentUser = store.currentUser;

  // 1. Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Inactive user (Per Section 4B: "Jika tutor dinonaktifkan, aksesnya harus ditolak oleh backend, bukan hanya disembunyikan")
  if (!currentUser.is_active) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-card text-center border border-rose-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slateNavy-900">Akun Anda Dinonaktifkan</h2>
          <p className="text-sm text-slateNavy-500 mt-2 mb-6">
            Akses ke sistem Syafa Course ditangguhkan oleh Administrator. Silakan hubungi admin pusat untuk mengaktifkan kembali akun Anda.
          </p>
          <Button
            variant="outline"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={() => {
              store.logout();
            }}
          >
            Keluar dari Akun
          </Button>
        </div>
      </div>
    );
  }

  // 3. Role mismatch (Admin trying to open tutor page, or Tutor trying to open admin page)
  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/tutor'} replace />;
  }

  return <Outlet />;
};
