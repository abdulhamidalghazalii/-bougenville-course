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
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const hasAdmin = store.hasAdminAccount();

  // Mode: if no admin exists, default to bootstrap registration mode
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
      setError('Silakan masukkan email dan kata sandi.');
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
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 to-brand-400 text-white shadow-xl shadow-brand-500/25 mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">Syafa Course</h1>
        <p className="text-sm text-slateNavy-500 mt-1 font-medium">
          Sistem Manajemen Les Privat & Monitoring Belajar Calistung
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-slateNavy-100">
          {!hasAdmin || isRegisterAdmin ? (
            /* BOOTSTRAP: INITIAL ADMIN REGISTRATION */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Pengaturan Awal Sistem</span>
                </div>
                <h2 className="text-lg font-bold text-slateNavy-900">Buat Akun Administrator Utama</h2>
                <p className="text-xs text-slateNavy-500 mt-0.5">
                  Daftarkan akun administrator pengelola Syafa Course untuk memulai.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterAdmin} className="space-y-3.5">
                <Input
                  label="Nama Lengkap Administrator *"
                  placeholder="Contoh: Sarah Rahmawati, S.Pd"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Alamat Email Resmi *"
                  type="email"
                  placeholder="admin@syafacourse.id"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Nomor WhatsApp"
                  placeholder="081234567890"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <Input
                  label="Kata Sandi Baru *"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Konfirmasi Kata Sandi *"
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
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
                    Daftarkan Administrator Utama
                  </Button>
                </div>

                {hasAdmin && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setIsRegisterAdmin(false)}
                      className="text-xs text-brand-600 font-semibold hover:underline"
                    >
                      Kembali ke Halaman Masuk (Login)
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* STANDARD LOGIN FORM */
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slateNavy-900">Masuk ke Portal</h2>
                <p className="text-xs text-slateNavy-500">
                  Gunakan email dan kata sandi yang telah didaftarkan.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Alamat Email"
                  type="email"
                  placeholder="nama@syafacourse.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                  required
                />

                <Input
                  label="Kata Sandi"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
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
                    Masuk ke Aplikasi
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slateNavy-100 text-center text-xs text-slateNavy-500">
                <p>
                  Belum memiliki akun tutor? Hubungi Administrator Pusat untuk mendapatkan kredensial login.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security & Cloudflare Info */}
        <div className="mt-6 text-center text-xs text-slateNavy-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sistem Keamanan Autentikasi & Hak Akses Terenkripsi</span>
          </p>
          <p className="text-[11px] text-slateNavy-400">
            Syafa Course • Target Biaya Rp0 Cloudflare Pages & Supabase
          </p>
        </div>
      </div>
    </div>
  );
};
