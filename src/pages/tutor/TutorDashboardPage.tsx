import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Calendar,
  CheckCircle,
  FileText,
  UserPlus,
  PlusCircle,
  BookOpenCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TutorDashboardPage: React.FC = () => {
  const store = useAppStore();
  const navigate = useNavigate();

  const currentTutor = store.currentUser;
  const myStudents = store.getTutorStudents();
  const activeStudents = myStudents.filter((s) => s.status === 'active');
  const mySchedules = store.getTutorSchedules();
  const mySessions = store.getTutorSessions();
  const myReports = store.getTutorReports();

  // Today's date in local YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's schedules
  const todaySchedules = mySchedules.filter((sch) => sch.start_at.startsWith(todayStr));

  // Sessions completed this month (October 2026)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const completedThisMonth = mySessions.filter(
    (ses) => ses.status === 'finalized' && ses.session_date.startsWith(currentMonthPrefix)
  );

  // Attendance summary
  const tutorStudentIds = new Set(myStudents.map((s) => s.id));
  const relevantAttendances = store.attendances.filter((a) => tutorStudentIds.has(a.student_id));
  const totalAtt = relevantAttendances.length;
  const presentAtt = relevantAttendances.filter((a) => a.status === 'present').length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

  // Students needing attention (have difficult notes or low evaluation)
  const studentsNeedingPractice = myStudents.filter((stu) => {
    const studentSessions = mySessions.filter((s) => s.student_id === stu.id);
    if (studentSessions.length === 0) return true;
    const latest = studentSessions[0];
    return latest.difficulties || latest.assessments?.some((a) => a.assessment_level === 'BB' || a.assessment_level === 'MB');
  });

  // Selected student for quick visual chart preview
  const [selectedStudentId, setSelectedStudentId] = useState<string>(myStudents[0]?.id || '');
  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  // Chart data for selected student's recent finalized sessions
  const studentSessions = selectedStudent
    ? mySessions.filter((s) => s.student_id === selectedStudent.id && s.status === 'finalized').slice(0, 5).reverse()
    : [];

  const chartData = studentSessions.map((ses, idx) => {
    const assessments = ses.assessments || [];
    const scored = assessments.filter((a) => a.assessment_level !== 'UNASSESSED');
    const scoreMap: Record<string, number> = { BB: 1, MB: 2, BSH: 3, BSB: 4 };
    const avgScore =
      scored.length > 0
        ? Number((scored.reduce((acc, cur) => acc + (scoreMap[cur.assessment_level] || 0), 0) / scored.length).toFixed(1))
        : 0;

    return {
      name: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      skorRataRata: avgScore,
      indikatorDinilai: scored.length,
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-pastelPink-500 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="blue" className="bg-white/20 text-white border-white/30 backdrop-blur-md mb-2">
            Selamat Datang, {currentTutor?.full_name}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Pembelajaran Calistung
          </h1>
          <p className="text-sm text-white/90 mt-2 font-medium">
            Pantau kehadiran, jadwalkan les, dan catat hasil evaluasi membaca, menulis, serta berhitung dengan mudah dan ceria.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => navigate('/tutor/students')}
              className="bg-white text-brand-700 hover:bg-cream-100 shadow-sm"
            >
              Tambah Siswa
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => navigate('/tutor/schedules')}
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-md"
            >
              Buat Jadwal
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<BookOpenCheck className="w-4 h-4" />}
              onClick={() => navigate('/tutor/sessions')}
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-md"
            >
              Input Hasil Belajar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => navigate('/tutor/reports')}
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30 backdrop-blur-md"
            >
              Buat Laporan PDF
            </Button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Dynamic Statistics Cards from Database */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Siswa Aktif"
          value={activeStudents.length}
          subtitle={`Total ${myStudents.length} terdaftar`}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-blue-50 text-blue-600"
          onClick={() => navigate('/tutor/students')}
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={todaySchedules.length}
          subtitle="Sesi les terjadwal"
          icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-amber-50 text-amber-600"
          onClick={() => navigate('/tutor/schedules')}
        />
        <StatCard
          title="Selesai Bulan Ini"
          value={completedThisMonth.length}
          subtitle="Sesi telah difinalisasi"
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          onClick={() => navigate('/tutor/sessions')}
        />
        <StatCard
          title="Tingkat Kehadiran"
          value={`${attendanceRate}%`}
          subtitle={`${presentAtt} dari ${totalAtt} pertemuan`}
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBgColor="bg-purple-50 text-purple-600"
          onClick={() => navigate('/tutor/schedules')}
        />
      </div>

      {/* Actionable Alerts & Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Attention List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Hari Ini */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slateNavy-900">Jadwal Les Hari Ini</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/tutor/schedules')}
              >
                Lihat Kalender
              </Button>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="text-center py-6 bg-cream-50/50 rounded-2xl border border-dashed border-slateNavy-200">
                <Clock className="w-8 h-8 text-slateNavy-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slateNavy-700">Tidak ada jadwal les untuk hari ini.</p>
                <p className="text-[11px] text-slateNavy-400 mt-0.5">Nikmati waktu persiapan materi Anda!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-2xl border border-slateNavy-100 bg-white hover:border-brand-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slateNavy-900">{sch.student?.full_name}</span>
                        <Badge variant="blue" size="sm">
                          {sch.student?.education_level}
                        </Badge>
                      </div>
                      <p className="text-xs text-slateNavy-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slateNavy-400" />
                        <span>
                          {new Date(sch.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(sch.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slateNavy-300">•</span>
                        <span>{sch.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant={sch.status === 'completed' ? 'outline' : 'primary'}
                        size="sm"
                        leftIcon={<BookOpenCheck className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/tutor/sessions')}
                      >
                        {sch.status === 'completed' ? 'Evaluasi Selesai' : 'Buka Evaluasi'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Progress Chart Visualizer */}
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slateNavy-900">Grafik Perkembangan Belajar</h2>
                <p className="text-xs text-slateNavy-500">
                  Rata-rata capaian indikator calistung (Skala 1: BB, 2: MB, 3: BSH, 4: BSB)
                </p>
              </div>

              {/* Student Selector */}
              {myStudents.length > 0 && (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="rounded-xl border border-slateNavy-200 bg-white px-3 py-1.5 text-xs font-semibold text-slateNavy-800 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  {myStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.education_level})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="text-center py-10 bg-cream-50/50 rounded-2xl border border-dashed border-slateNavy-200">
                <TrendingUp className="w-8 h-8 text-slateNavy-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slateNavy-700">Belum ada evaluasi tersimpan untuk siswa ini.</p>
                <p className="text-[11px] text-slateNavy-400 mt-0.5">Selesaikan sesi les pertama untuk melihat grafik tren.</p>
              </div>
            ) : (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '1rem',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} / 4.0 (BSB)`, 'Rata-rata Skor']}
                    />
                    <Bar dataKey="skorRataRata" fill="#38A3F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Students needing attention & Reports status */}
        <div className="space-y-6">
          {/* Siswa Membutuhkan Latihan Tambahan */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slateNavy-900">Perhatian Belajar Khusus</h2>
            </div>
            <p className="text-xs text-slateNavy-500 mb-4">
              Berdasarkan catatan kesulitan belajar dan indikator MB/BB pada pertemuan terakhir:
            </p>

            <div className="space-y-3">
              {studentsNeedingPractice.length === 0 ? (
                <p className="text-xs text-slateNavy-500 py-3 text-center bg-cream-50 rounded-xl">
                  Semua siswa terpantau berkembang dengan baik.
                </p>
              ) : (
                studentsNeedingPractice.slice(0, 3).map((stu) => (
                  <div
                    key={stu.id}
                    className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slateNavy-900">{stu.full_name}</span>
                      <Badge variant="amber" size="sm">
                        {stu.education_level}
                      </Badge>
                    </div>
                    <p className="text-slateNavy-600 line-clamp-2 text-[11px]">
                      {stu.learning_needs || 'Perlu pembiasaan pengenalan huruf dan latihan motorik halus di rumah.'}
                    </p>
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={() => navigate(`/tutor/students/${stu.id}`)}
                        className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                      >
                        Lihat Rincian <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Contact Wali Siswa */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slateNavy-900">Kontak Orang Tua Cepat</h2>
            </div>
            {myStudents.length === 0 ? (
              <p className="text-xs text-slateNavy-500 py-3 text-center bg-cream-50 rounded-xl">
                Belum ada kontak orang tua siswa tersimpan.
              </p>
            ) : (
              <div className="space-y-2.5">
                {myStudents.map((stu) => (
                  <div
                    key={stu.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slateNavy-50 border border-slateNavy-100 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slateNavy-800">{stu.parent?.full_name || 'Wali Siswa'}</div>
                      <div className="text-[10px] text-slateNavy-500">Wali dari {stu.full_name}</div>
                    </div>
                    {stu.parent?.whatsapp_number && (
                      <a
                        href={`https://wa.me/${stu.parent.whatsapp_number.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
