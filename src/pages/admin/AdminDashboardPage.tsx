import React from 'react';
import { useAppStore } from '../../lib/store';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const tutors = store.tutors;
  const totalTutors = tutors.length;
  const activeTutors = tutors.filter((t) => t.is_active).length;
  const inactiveTutors = totalTutors - activeTutors;

  const recentAudits = store.auditLogs
    .filter((a) => a.entity_type === 'profile')
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Dashboard Administrator
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Pengelolaan kredensial akun tutor, status keaktifan, dan audit keamanan sistem.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => navigate('/admin/tutors')}
        >
          Kelola Akun Tutor
        </Button>
      </div>

      {/* Role Boundary Notice */}
      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold">Prinsip Keamanan Role-Based Separation: </span>
          Admin hanya berwenang mengelola otorisasi akun tutor dan tidak memiliki akses baca/tulis ke data siswa, catatan operasional pembelajaran, maupun laporan calistung privat anak.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Akun Tutor"
          value={totalTutors}
          subtitle="Tutor terdaftar di sistem"
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-blue-50 text-blue-600"
          onClick={() => navigate('/admin/tutors')}
        />
        <StatCard
          title="Tutor Aktif"
          value={activeTutors}
          subtitle="Dapat login dan mengajar"
          icon={<UserCheck className="w-6 h-6" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          onClick={() => navigate('/admin/tutors')}
        />
        <StatCard
          title="Tutor Nonaktif"
          value={inactiveTutors}
          subtitle="Akses sistem ditangguhkan"
          icon={<UserX className="w-6 h-6" />}
          iconBgColor="bg-rose-50 text-rose-600"
          onClick={() => navigate('/admin/tutors')}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Accounts Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slateNavy-900">Daftar Akun Tutor</h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/admin/tutors')}
            >
              Lihat Semua
            </Button>
          </div>

          <Card className="p-0 overflow-hidden">
            {tutors.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Users className="w-8 h-8 text-brand-400 mx-auto" />
                <p className="text-xs text-slateNavy-500">Belum ada akun tutor yang dibuat.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/admin/tutors')}>
                  Tambah Akun Tutor Baru
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slateNavy-100">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-cream-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                        {tutor.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slateNavy-900">{tutor.full_name}</span>
                          <Badge variant={tutor.is_active ? 'green' : 'rose'} size="sm">
                            {tutor.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slateNavy-500 mt-0.5">{tutor.email}</div>
                        {tutor.phone && <div className="text-[11px] text-slateNavy-400">WA: {tutor.phone}</div>}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slateNavy-400 block text-[11px]">Login Terakhir</span>
                      <span className="font-medium text-slateNavy-700">
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
          </Card>
        </div>

        {/* Audit Log Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slateNavy-900">Aktivitas Akun Terbaru</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/audit')}
            >
              Log Lengkap
            </Button>
          </div>

          <Card className="p-4 space-y-3">
            {recentAudits.length === 0 ? (
              <p className="text-xs text-slateNavy-500 text-center py-4">Belum ada riwayat audit tercatat.</p>
            ) : (
              recentAudits.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-100 text-xs">
                  <div className="flex items-center justify-between text-slateNavy-500 text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-slateNavy-700">{item.action}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-medium text-slateNavy-800">
                    Oleh: {item.actor_name}
                  </p>
                  {item.details && (
                    <p className="text-[11px] text-slateNavy-500 mt-0.5 truncate">
                      {JSON.stringify(item.details)}
                    </p>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
