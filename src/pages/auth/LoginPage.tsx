import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const hasAdmin = store.hasAdminAccount();
  const [isRegisterAdmin, setIsRegisterAdmin] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register Admin form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Silakan masukkan alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    const res = store.login(email, password);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/tutor');
      }
    } else {
      setError(res.message);
    }

    setIsLoading(false);
  };

  const handleQuickLogin = (role: 'tutor' | 'admin') => {
    if (role === 'tutor') {
      const tutorAccount = store.accounts.find((a) => a.role === 'tutor') || {
        email: 'aisyah@syafacourse.id',
      };
      const res = store.login(tutorAccount.email, 'tutor123');
      if (res.success) {
        navigate('/tutor');
      } else {
        setEmail(tutorAccount.email);
        setPassword('tutor123');
      }
    } else {
      const adminAccount = store.accounts.find((a) => a.role === 'admin') || {
        email: 'admin@syafacourse.id',
      };
      const res = store.login(adminAccount.email, 'admin123');
      if (res.success) {
        navigate('/admin');
      } else {
        setEmail(adminAccount.email);
        setPassword('admin123');
      }
    }
  };

  const handleRegisterAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setError('Mohon lengkapi semua field yang diperlukan.');
      return;
    }

    if (adminPassword.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    const res = store.registerFirstAdmin({
      full_name: adminName.trim(),
      email: adminEmail.trim(),
      phone: adminPhone.trim(),
      password: adminPassword,
    });

    if (res.success && res.user) {
      navigate('/admin');
    } else {
      setError(res.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slateGray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo - Clean Navy Ink Badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-navyInk-700 text-white shadow-subtle mb-3">
          <GraduationCap className="w-8 h-8 text-softBlue-100" />
        </div>
        <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">Syafa Course</h1>
        <p className="text-xs text-slateGray-500 mt-1 font-medium">
          Sistem Manajemen Les Privat & Monitoring Belajar Calistung Anak
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-card rounded-xl border border-slateGray-200 space-y-5">
          {/* Quick Access Card (Sangat Membantu saat Uji Coba di Vercel) */}
          <div className="p-3.5 rounded-lg bg-softBlue/60 border border-navyInk-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-navyInk-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-navyInk-600" />
                <span>Akses Cepat Pengujian</span>
              </span>
              <span className="text-[10px] text-navyInk-600 font-semibold bg-white px-2 py-0.5 rounded">
                1-Klik Masuk
              </span>
            </div>
            <p className="text-[11px] text-slateGray-600 leading-tight">
              Pilih peran di bawah ini untuk langsung mencoba fitur aplikasi:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('tutor')}
                className="p-2 rounded bg-white border border-slateGray-200 text-navyInk-700 hover:bg-slateGray-50 transition-colors text-left"
              >
                <div className="font-bold text-[11px] flex items-center gap-1 text-navyInk-700">
                  <BookOpen className="w-3 h-3 text-navyInk-600" />
                  <span>Portal Tutor</span>
                </div>
                <div className="text-[10px] text-slateGray-500 truncate">Aisyah Putri, S.Pd</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded bg-white border border-slateGray-200 text-navyInk-700 hover:bg-slateGray-50 transition-colors text-left"
              >
                <div className="font-bold text-[11px] flex items-center gap-1 text-purple-700">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Portal Admin</span>
                </div>
                <div className="text-[10px] text-slateGray-500 truncate">Sarah Rahmawati, S.Pd</div>
              </button>
            </div>
          </div>

          {!isRegisterAdmin ? (
            /* STANDARD LOGIN FORM */
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-navyInk-700">Masuk ke Akun Anda</h2>
                <p className="text-xs text-slateGray-500">
                  Masukkan email dan kata sandi akun operasional Syafa Course.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                <Input
                  label="Alamat Email"
                  type="email"
                  placeholder="tutor@syafacourse.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-slateGray-400" />}
                  autoComplete="email"
                  required
                />

                <Input
                  label="Kata Sandi"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slateGray-400" />}
                  autoComplete="current-password"
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Masuk ke Sistem
                  </Button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-slateGray-100 flex items-center justify-between text-xs text-slateGray-500">
                <span>Perlu buat admin baru?</span>
                <button
                  type="button"
                  onClick={() => setIsRegisterAdmin(true)}
                  className="font-bold text-navyInk-600 hover:underline"
                >
                  Registrasi Admin
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-navyInk-700">Daftarkan Admin Baru</h2>
                <p className="text-xs text-slateGray-500">
                  Buat akun administrator pengelola baru untuk lembaga les.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterAdmin} className="space-y-3">
                <Input
                  label="Nama Lengkap *"
                  placeholder="Nama Administrator"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="admin@syafacourse.id"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <Input
                  label="Kata Sandi *"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <Input
                  label="Konfirmasi Kata Sandi *"
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsRegisterAdmin(false)}
                    className="text-xs text-slateGray-500 hover:underline"
                  >
                    ← Kembali ke Login
                  </button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                    Daftarkan Admin
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="mt-5 text-center text-xs text-slateGray-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-deepSage" />
            <span>Sistem Bimbingan Calistung Terpadu Syafa Course</span>
          </p>
        </div>
      </div>
    </div>
  );
};
