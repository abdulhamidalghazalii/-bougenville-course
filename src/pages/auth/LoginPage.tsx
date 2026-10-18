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
  const [isRegisterAdmin, setIsRegisterAdmin] = useState(!hasAdmin);

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
        <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">Bougenville Course</h1>
        <p className="text-xs text-slateGray-500 mt-1 font-medium">
          Sistem Manajemen Les Privat & Monitoring Belajar Calistung Anak
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-card rounded-xl border border-slateGray-200 space-y-5">
          {!isRegisterAdmin ? (
            /* STANDARD LOGIN FORM */
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-navyInk-700">Masuk ke Akun Anda</h2>
                <p className="text-xs text-slateGray-500">
                  Masukkan email dan kata sandi akun operasional Bougenville Course.
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
                  placeholder="admin@bougenvillecourse.id"
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
                  placeholder="admin@bougenvillecourse.id"
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
            <span>Sistem Bimbingan Calistung Terpadu Bougenville Course</span>
          </p>
        </div>
      </div>
    </div>
  );
};
