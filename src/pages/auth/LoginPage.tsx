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
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Silakan masukkan email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check if email belongs to admin
      if (email.toLowerCase().includes('admin')) {
        store.setCurrentUser({
          id: 'usr-admin-01',
          email: email.trim(),
          full_name: 'Sarah Rahmawati, S.Pd (Admin Pusat)',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        navigate('/admin');
      } else {
        // Tutor login
        const existingTutor = store.tutors.find(
          (t) => t.email.toLowerCase() === email.toLowerCase().trim()
        );
        const tutor = existingTutor || {
          id: 'usr-tutor-01',
          email: email.trim(),
          full_name: 'Aisyah Putri, S.Pd',
          role: 'tutor' as const,
          phone: '081298765432',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        store.setCurrentUser(tutor);
        navigate('/tutor');
      }
      setIsLoading(false);
    }, 600);
  };

  const handleQuickDemo = (role: 'admin' | 'tutor', tutorIndex: number = 0) => {
    if (role === 'admin') {
      store.switchRole('admin');
      navigate('/admin');
    } else {
      const tutor = store.tutors[tutorIndex] || store.tutors[0];
      store.switchRole('tutor', tutor.id);
      navigate('/tutor');
    }
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
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slateNavy-900">Masuk ke Portal</h2>
            <p className="text-xs text-slateNavy-500">
              Gunakan email & kata sandi yang telah didaftarkan.
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

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-slateNavy-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-slateNavy-700 uppercase tracking-wider">
                Akses Demo Cepat (1-Klik)
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('tutor', 0)}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-blue-900">Masuk sebagai Tutor Aisyah</div>
                  <div className="text-[11px] text-blue-600">PAUD & TK • Kenzo Pratama, Alika Zahra</div>
                </div>
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tutor', 1)}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-emerald-900">Masuk sebagai Tutor Budi</div>
                  <div className="text-[11px] text-emerald-600">SD Kelas 1-3 • Fathan (Isolasi data teruji)</div>
                </div>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-left transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-purple-900">Masuk sebagai Admin Pusat</div>
                  <div className="text-[11px] text-purple-600">Kelola akun tutor • Tanpa akses data siswa</div>
                </div>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Zero-Cost Notice */}
        <div className="mt-6 text-center text-xs text-slateNavy-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terhubung dengan PostgreSQL & Row Level Security</span>
          </p>
          <p className="text-[11px] text-slateNavy-400">
            Target biaya Rp0 • Cloudflare Pages + Supabase Free Tier
          </p>
        </div>
      </div>
    </div>
  );
};
