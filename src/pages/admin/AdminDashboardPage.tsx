import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Clock,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';

export const AdminDashboardPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const currentUser = store.currentUser;
  const tutors = store.tutors;
  const totalTutors = tutors.length;
  const activeTutors = tutors.filter((t) => t.is_active).length;
  const inactiveTutors = totalTutors - activeTutors;

  const recentAudits = store.auditLogs
    .filter((a) => a.entity_type === 'profile')
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-navyInk-700">Bougenville Course</span>
            <span className="text-slateGray-300">•</span>
            <span className="text-slateGray-500">Panel Administrator Lembaga</span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight">
            Pengelolaan Akun & Akses Tutor
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Manajemen kredensial pengajar, status akun aktif/nonaktif, dan audit log keamanan sistem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<KeyRound className="w-4 h-4 text-slateGray-600" />}
            onClick={() => setIsChangePasswordOpen(true)}
          >
            Ubah Password Admin
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => navigate('/admin/tutors')}
          >
            Kelola Akun Tutor
          </Button>
        </div>
      </div>

      {/* Role Boundary Notice */}
      <div className="p-3.5 rounded-lg bg-slateGray-100 border border-slateGray-200 text-slateGray-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-navyInk-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-navyInk-800">Prinsip Keamanan Pemisahan Akses: </span>
          Administrator hanya berwenang mengelola otorisasi akun pengajar. Data operasional pembelajaran, catatan perkembangan siswa, dan lembar rapor bulanan diisolasi khusus untuk tutor penanggung jawab.
        </div>
      </div>

      {/* Clean Metric Indicators */}
      <div className="bg-white rounded-xl border border-slateGray-200 p-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slateGray-200">
        <div className="p-2 sm:p-3 cursor-pointer hover:bg-slateGray-50 transition-colors rounded-lg" onClick={() => navigate('/admin/tutors')}>
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Total Akun Tutor</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{totalTutors} Pengajar</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">Terdaftar pada sistem</span>
        </div>

        <div className="p-2 sm:p-3 cursor-pointer hover:bg-slateGray-50 transition-colors rounded-lg" onClick={() => navigate('/admin/tutors')}>
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Tutor Aktif</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{activeTutors} Akun</div>
          <span className="text-[11px] text-deepSage font-medium mt-0.5 block">Dapat login dan mengajar</span>
        </div>

        <div className="p-2 sm:p-3 cursor-pointer hover:bg-slateGray-50 transition-colors rounded-lg" onClick={() => navigate('/admin/tutors')}>
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Tutor Nonaktif</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{inactiveTutors} Akun</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">Akses masuk ditangguhkan</span>
        </div>
      </div>

      {/* Main Grid: Tutor Accounts & Security / Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Accounts Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navyInk-700">Daftar Akun Pengajar</h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/admin/tutors')}
            >
              Lihat Semua Akun
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slateGray-200 overflow-hidden">
            {tutors.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Users className="w-8 h-8 text-slateGray-400 mx-auto" />
                <p className="text-xs text-slateGray-500">Belum ada akun tutor yang dibuat.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/tutors')}>
                  Tambah Akun Tutor Baru
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slateGray-100">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="p-4 flex items-center justify-between hover:bg-slateGray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-softBlue text-navyInk-700 font-bold flex items-center justify-center text-sm shrink-0">
                        {tutor.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navyInk-700">{tutor.full_name}</span>
                          <span
                            className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold ${
                              tutor.is_active
                                ? 'bg-sageGreen text-deepSage'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {tutor.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="text-xs text-slateGray-500 mt-0.5">{tutor.email}</div>
                        {tutor.phone && <div className="text-[11px] text-slateGray-400">WA: {tutor.phone}</div>}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slateGray-400 block text-[11px]">Login Terakhir</span>
                      <span className="font-medium text-slateGray-700">
                        {tutor.last_sign_in_at
                          ? new Date(tutor.last_sign_in_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Belum pernah'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Keamanan Akun Admin & Audit Log */}
        <div className="space-y-5">
          {/* Admin Security Card */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-navyInk-700" />
                <h3 className="font-bold text-navyInk-700">Keamanan Akun Admin</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-softBlue text-navyInk-700">
                Utama
              </span>
            </div>

            <div className="space-y-2 text-slateGray-600">
              <div className="flex justify-between">
                <span className="text-slateGray-400">Nama Akun:</span>
                <span className="font-bold text-navyInk-800">{currentUser?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slateGray-400">Email Login:</span>
                <span className="font-mono text-slateGray-700">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slateGray-400">Status Akses:</span>
                <span className="font-bold text-deepSage">Aktif (Super Administrator)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slateGray-100">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Ganti Kata Sandi Admin
              </Button>
            </div>
          </div>

          {/* Audit Log Activities */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-2.5">
              <h3 className="font-bold text-navyInk-700">Aktivitas Akun Terbaru</h3>
              <button
                type="button"
                onClick={() => navigate('/admin/audit')}
                className="text-[11px] font-semibold text-navyInk-600 hover:underline"
              >
                Log Lengkap
              </button>
            </div>

            {recentAudits.length === 0 ? (
              <p className="text-slateGray-400 text-center py-4 text-[11px]">Belum ada riwayat audit tercatat.</p>
            ) : (
              <div className="space-y-2">
                {recentAudits.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slateGray-50 border border-slateGray-200 text-xs">
                    <div className="flex items-center justify-between text-slateGray-500 text-[10px] mb-1">
                      <span className="font-bold uppercase tracking-wider text-navyInk-700">{item.action}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slateGray-400" />
                        {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slateGray-600">
                      Oleh: <strong>{item.actor_name}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal for Admin */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        targetUserId={currentUser?.id}
        targetUserName={currentUser?.full_name}
      />
    </div>
  );
};
