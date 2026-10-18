import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  UserPlus,
  BookOpenCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  MapPin,
  CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const currentMonthPrefix = todayStr.substring(0, 7);

  // 1. Jadwal terdekat (hari ini dan mendatang)
  const upcomingSchedules = mySchedules
    .filter((sch) => sch.status === 'scheduled')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .slice(0, 4);

  // 2. Siswa yang perlu dievaluasi (belum ada sesi difinalisasi minggu ini atau memiliki catatan kendala)
  const studentsNeedingEvaluation = myStudents.filter((stu) => {
    const studentSessions = mySessions.filter((s) => s.student_id === stu.id);
    if (studentSessions.length === 0) return true;
    const latest = studentSessions[0];
    return latest.status === 'draft' || !!latest.difficulties;
  });

  // 3. Catatan pembelajaran terbaru (sesi terakhir)
  const recentSessions = mySessions.slice(0, 4);

  // 4. Laporan yang belum diterbitkan bulan ini
  const reportedStudentIds = new Set(
    myReports
      .filter((r) => r.period_start.startsWith(currentMonthPrefix))
      .map((r) => r.student_id)
  );
  const studentsWithoutMonthlyReport = activeStudents.filter((s) => !reportedStudentIds.has(s.id));

  // 5. Ringkasan kehadiran bulan berjalan
  const tutorStudentIds = new Set(myStudents.map((s) => s.id));
  const relevantAttendances = store.attendances.filter(
    (a) => tutorStudentIds.has(a.student_id) && a.date.startsWith(currentMonthPrefix)
  );
  const totalAtt = relevantAttendances.length;
  const presentAtt = relevantAttendances.filter((a) => a.status === 'present').length;
  const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;

  // Selected student for Functional Progress Chart
  const [selectedStudentId, setSelectedStudentId] = useState<string>(myStudents[0]?.id || '');
  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  const studentFinalizedSessions = selectedStudent
    ? mySessions
        .filter((s) => s.student_id === selectedStudent.id && s.status === 'finalized')
        .slice(0, 6)
        .reverse()
    : [];

  const chartData = studentFinalizedSessions.map((ses, idx) => {
    const asm = ses.assessments || [];
    const getDomainAvg = (cat: 'membaca' | 'menulis' | 'berhitung') => {
      const catIndIds = new Set(store.indicators.filter((i) => i.category === cat).map((i) => i.id));
      const relevant = asm.filter((a) => catIndIds.has(a.indicator_id) && a.assessment_level !== 'UNASSESSED');
      if (relevant.length === 0) return null;
      const scoreMap: Record<string, number> = { BB: 1, MB: 2, BSH: 3, BSB: 4 };
      const sum = relevant.reduce((acc, c) => acc + (scoreMap[c.assessment_level] || 0), 0);
      return Number((sum / relevant.length).toFixed(1));
    };

    return {
      sessionLabel: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      Membaca: getDomainAvg('membaca'),
      Menulis: getDomainAvg('menulis'),
      Berhitung: getDomainAvg('berhitung'),
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* 1. Clean Header Strip (Anti-AI-Slop, No huge gradients) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slateGray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navyInk-700">
              Portal Pengajar Calistung
            </span>
            <span className="text-slateGray-300">•</span>
            <span className="text-xs text-slateGray-500">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navyInk-700 tracking-tight mt-1">
            Selamat Datang, {currentTutor?.full_name?.split(',')[0]}
          </h1>
          <p className="text-xs text-slateGray-500 mt-0.5">
            Kelola jadwal les, input evaluasi formatif calistung, dan pantau penyusunan rapor bulanan siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Calendar className="w-4 h-4 text-slateGray-600" />}
            onClick={() => navigate('/tutor/schedules')}
          >
            Kelola Jadwal
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<BookOpenCheck className="w-4 h-4" />}
            onClick={() => navigate('/tutor/sessions')}
          >
            Catat Pertemuan Baru
          </Button>
        </div>
      </div>

      {/* 2. Measured Metric Indicators (Relevan, Sederhana, Tidak Berlebihan) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slateGray-200">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Siswa Aktif Bimbingan</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{activeStudents.length} Anak</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">PAUD, TK, dan SD Kelas 1-2</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slateGray-200">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Pertemuan Bulan Ini</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{relevantAttendances.length} Sesi</div>
          <span className="text-[11px] text-slateGray-400 mt-0.5 block">Periode {currentMonthStr}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slateGray-200">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Tingkat Hadir Siswa</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{attendanceRate}%</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Presensi tercatat disiplin</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slateGray-200">
          <span className="text-[11px] font-bold uppercase text-slateGray-500 block">Rapor Belum Terbit</span>
          <div className="text-2xl font-bold text-navyInk-700 mt-1">{studentsWithoutMonthlyReport.length} Siswa</div>
          <span className="text-[11px] text-softCoral-500 font-medium mt-0.5 block">Perlu disiapkan untuk wali murid</span>
        </div>
      </div>

      {/* 3. Main Operational Sections: Jadwal Terdekat & Siswa Perlu Tindakan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Jadwal Terdekat & Catatan Belajar Terbaru (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Jadwal Terdekat */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-navyInk-600" />
                <h2 className="text-sm font-bold text-navyInk-700">Jadwal Sesi Les Terdekat</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tutor/schedules')}
                className="text-xs font-semibold text-navyInk-600 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="py-6 text-center text-xs text-slateGray-400">
                Belum ada jadwal pertemuan mendatang. Silakan buat jadwal baru.
              </div>
            ) : (
              <div className="divide-y divide-slateGray-100">
                {upcomingSchedules.map((sch) => {
                  const student = myStudents.find((s) => s.id === sch.student_id);
                  const isToday = sch.start_at.startsWith(todayStr);

                  return (
                    <div key={sch.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navyInk-700 text-sm">
                            {student?.full_name || 'Siswa'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-softBlue text-navyInk-700">
                            {student?.education_level}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-slateGray-500 text-[11px]">
                          <span>
                            {new Date(sch.start_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(sch.end_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slateGray-400" />
                            {sch.location}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/tutor/sessions')}
                      >
                        Catat Sesi
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Catatan Pembelajaran Terbaru */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-navyInk-600" />
                <h2 className="text-sm font-bold text-navyInk-700">Catatan Pembelajaran Terbaru</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tutor/sessions')}
                className="text-xs font-semibold text-navyInk-600 hover:underline flex items-center gap-1"
              >
                <span>Riwayat Sesi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slateGray-400">
                Belum ada sesi pembelajaran yang dicatat.
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((ses) => {
                  const student = myStudents.find((s) => s.id === ses.student_id);

                  return (
                    <div
                      key={ses.id}
                      className="p-3.5 rounded-lg border border-slateGray-100 bg-slateGray-50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navyInk-700">{student?.full_name}</span>
                          <span className="text-[11px] text-slateGray-400">
                            ({new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})
                          </span>
                        </div>
                        <Badge variant={ses.status === 'finalized' ? 'green' : 'amber'} size="sm">
                          {ses.status === 'finalized' ? 'Difinalisasi' : 'Draf'}
                        </Badge>
                      </div>

                      <p className="text-slateGray-600 line-clamp-1">
                        <strong>Materi:</strong> {ses.material}
                      </p>

                      {ses.teacher_notes && (
                        <p className="text-[11px] text-slateGray-500 italic line-clamp-1">
                          "{ses.teacher_notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tindakan Laporan & Grafik Fungsional (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 3: Rapor Bulanan Perlu Diterbitkan */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-navyInk-600" />
                <h2 className="text-sm font-bold text-navyInk-700">Rapor Bulanan Perlu Disiapkan</h2>
              </div>
              <span className="text-[11px] text-slateGray-400">{currentMonthStr}</span>
            </div>

            {studentsWithoutMonthlyReport.length === 0 ? (
              <div className="py-4 text-center text-xs text-emerald-800 bg-sageGreen rounded-lg p-3">
                Seluruh siswa telah memiliki rapor bulanan untuk periode {currentMonthStr}.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slateGray-500">
                  {studentsWithoutMonthlyReport.length} siswa belum dibuatkan rapor untuk bulan ini:
                </p>
                <div className="divide-y divide-slateGray-100 max-h-56 overflow-y-auto pr-1">
                  {studentsWithoutMonthlyReport.map((stu) => (
                    <div key={stu.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-navyInk-700 block">{stu.full_name}</span>
                        <span className="text-[11px] text-slateGray-400">Wali: {stu.parent?.full_name || 'Ayah/Bunda'}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/tutor/reports')}
                      >
                        Susun Rapor
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Grafik Perkembangan Nyata (Hanya jika ada data historis) */}
          <div className="bg-white rounded-xl border border-slateGray-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slateGray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-navyInk-700">Grafik Capaian Calistung</h2>
                <p className="text-[11px] text-slateGray-400">Skala 1 (BB) s/d 4 (BSB) per sesi</p>
              </div>
              {myStudents.length > 0 && (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs border border-slateGray-200 rounded-lg px-2 py-1 bg-white font-medium text-navyInk-700 focus:outline-none"
                >
                  {myStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {chartData.length < 2 ? (
              <div className="py-8 text-center text-xs text-slateGray-400 space-y-1">
                <p>Belum cukup data historis untuk siswa ini.</p>
                <p className="text-[11px] text-slateGray-400">
                  Minimal 2 sesi yang telah difinalisasi diperlukan untuk memplot tren.
                </p>
              </div>
            ) : (
              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="sessionLabel" tick={{ fontSize: 9, fill: '#64748B' }} />
                    <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 9, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="Membaca" stroke="#17365D" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Menulis" stroke="#DC644D" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Berhitung" stroke="#467F46" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 text-[10px] text-slateGray-500 pt-2 border-t border-slateGray-100">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-navyInk-700 inline-block" /> Membaca</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-softCoral-500 inline-block" /> Menulis</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-sageGreen-500 inline-block" /> Berhitung</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
