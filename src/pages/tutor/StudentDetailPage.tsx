import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { ASSESSMENT_CONFIG, AssessmentLevel } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  Phone,
  BookOpenCheck,
  TrendingUp,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppStore();

  const student = store.getStudentById(id || '');
  const sessions = student ? store.getStudentSessions(student.id) : [];
  const attendances = student ? store.getStudentAttendances(student.id) : [];
  const indicators = store.indicators;

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'ringkasan' | 'sesi' | 'membaca' | 'menulis' | 'berhitung' | 'kehadiran' | 'catatan' | 'laporan'
  >('ringkasan');

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slateNavy-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slateNavy-900">Siswa Tidak Ditemukan</h2>
          <p className="text-sm text-slateNavy-500 mt-1 mb-6">
            Data siswa tidak ditemukan atau Anda tidak memiliki akses ke siswa milik tutor lain (Isolasi Data RLS).
          </p>
          <Button variant="outline" onClick={() => navigate('/tutor/students')}>
            Kembali ke Daftar Siswa
          </Button>
        </div>
      </div>
    );
  }

  // Attendance stats
  const totalAtt = attendances.length;
  const presentCount = attendances.filter((a) => a.status === 'present').length;
  const permissionCount = attendances.filter((a) => a.status === 'permission').length;
  const sickCount = attendances.filter((a) => a.status === 'sick').length;
  const absentCount = attendances.filter((a) => a.status === 'absent').length;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  // Calistung Indicators categorized
  const readIndicators = indicators.filter((i) => i.category === 'membaca');
  const writeIndicators = indicators.filter((i) => i.category === 'menulis');
  const mathIndicators = indicators.filter((i) => i.category === 'berhitung');

  // Chart data: Trend score for each domain over finalized sessions
  const finalizedSessions = sessions.filter((s) => s.status === 'finalized').reverse();

  const trendData = finalizedSessions.map((ses, idx) => {
    const asm = ses.assessments || [];
    const getAvg = (cat: 'membaca' | 'menulis' | 'berhitung') => {
      const catIndIds = new Set(indicators.filter((i) => i.category === cat).map((i) => i.id));
      const relevant = asm.filter((a) => catIndIds.has(a.indicator_id) && a.assessment_level !== 'UNASSESSED');
      if (relevant.length === 0) return null;
      const scoreSum = relevant.reduce((acc, curr) => acc + (ASSESSMENT_CONFIG[curr.assessment_level]?.score || 0), 0);
      return Number((scoreSum / relevant.length).toFixed(1));
    };

    return {
      sessionName: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      Membaca: getAvg('membaca'),
      Menulis: getAvg('menulis'),
      Berhitung: getAvg('berhitung'),
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Back & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/tutor/students')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slateNavy-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Siswa</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<BookOpenCheck className="w-4 h-4" />}
            onClick={() => navigate('/tutor/sessions')}
          >
            Input Sesi Baru
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => {
              setActiveTab('laporan');
              navigate('/tutor/reports');
            }}
          >
            Buat Laporan PDF
          </Button>
        </div>
      </div>

      {/* Student Profile Hero Header */}
      <Card className="p-6 bg-gradient-to-r from-white via-cream-50 to-brand-50/40 border-brand-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500 to-brand-400 text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-brand-500/20 shrink-0">
              {student.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slateNavy-900">{student.full_name}</h1>
                <Badge variant="blue">{student.education_level}</Badge>
                <Badge variant={student.status === 'active' ? 'green' : 'slate'}>
                  {student.status === 'active' ? 'Aktif' : 'Arsip'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slateNavy-500 mt-1 font-medium">
                <span className="font-mono text-brand-700 font-bold">{student.student_code}</span>
                <span>•</span>
                <span>
                  Lahir:{' '}
                  {new Date(student.birth_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {student.school_class && (
                  <>
                    <span>•</span>
                    <span>{student.school_class}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slateNavy-100 shadow-xs">
            <div className="text-center px-3 border-r border-slateNavy-100">
              <span className="text-[10px] text-slateNavy-400 block font-bold uppercase">Sesi Les</span>
              <span className="text-lg font-extrabold text-brand-600">{sessions.length}</span>
            </div>
            <div className="text-center px-3 border-r border-slateNavy-100">
              <span className="text-[10px] text-slateNavy-400 block font-bold uppercase">Kehadiran</span>
              <span className="text-lg font-extrabold text-emerald-600">{attRate}%</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slateNavy-400 block font-bold uppercase">Wali Murid</span>
              <span className="text-xs font-bold text-slateNavy-800 line-clamp-1">
                {student.parent?.full_name?.split(' ')[0] || 'Wali'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 8 Tabs Navigation */}
      <div className="border-b border-slateNavy-200 overflow-x-auto">
        <div className="flex space-x-1 min-w-max pb-1">
          {[
            { key: 'ringkasan', label: 'Ringkasan' },
            { key: 'sesi', label: `Riwayat Sesi (${sessions.length})` },
            { key: 'membaca', label: 'Membaca' },
            { key: 'menulis', label: 'Menulis' },
            { key: 'berhitung', label: 'Berhitung' },
            { key: 'kehadiran', label: 'Kehadiran' },
            { key: 'catatan', label: 'Catatan Tutor' },
            { key: 'laporan', label: 'Laporan PDF' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slateNavy-600 hover:bg-cream-200 hover:text-slateNavy-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Ringkasan */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-5 space-y-4">
            <h3 className="font-bold text-sm text-slateNavy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>Tren Capaian Perkembangan Calistung</span>
            </h3>

            {trendData.length === 0 ? (
              <div className="text-center py-8 bg-cream-50/60 rounded-2xl border border-dashed border-slateNavy-200">
                <p className="text-xs text-slateNavy-500">
                  Data grafik tren akan muncul setelah tutor menyelesaikan dan memfinalisasi sesi belajar pertama.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="sessionName" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '1rem',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Membaca" stroke="#38A3F6" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Menulis" stroke="#EC4899" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Berhitung" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {student.learning_needs && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                  Fokus Pembelajaran & Kebutuhan Khusus:
                </span>
                <p className="text-slateNavy-700">{student.learning_needs}</p>
              </div>
            )}
          </Card>

          {/* Wali Murid Info */}
          <div className="space-y-4">
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-slateNavy-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                <span>Kontak Orang Tua / Wali</span>
              </h3>
              <div className="space-y-2 text-xs text-slateNavy-600">
                <div className="flex justify-between">
                  <span className="text-slateNavy-400">Nama:</span>
                  <span className="font-bold text-slateNavy-900">{student.parent?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slateNavy-400">Hubungan:</span>
                  <span className="font-semibold text-slateNavy-800">{student.parent_link?.relationship}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slateNavy-100">
                  <span className="text-slateNavy-400">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${student.parent?.whatsapp_number.replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {student.parent?.whatsapp_number}
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-sm text-slateNavy-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Standar Skala Penilaian</span>
              </h3>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Badge variant="green" size="sm">BSB (4)</Badge>
                  <span className="text-slateNavy-600">Berkembang Sangat Baik</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm">BSH (3)</Badge>
                  <span className="text-slateNavy-600">Berkembang Sesuai Harapan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber" size="sm">MB (2)</Badge>
                  <span className="text-slateNavy-600">Mulai Berkembang</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="rose" size="sm">BB (1)</Badge>
                  <span className="text-slateNavy-600">Belum Berkembang</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Sesi Belajar */}
      {activeTab === 'sesi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slateNavy-900">Riwayat Sesi Pembelajaran</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BookOpenCheck className="w-4 h-4" />}
              onClick={() => navigate('/tutor/sessions')}
            >
              Catat Sesi Baru
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slateNavy-200">
              <p className="text-xs text-slateNavy-500">Belum ada sesi pembelajaran yang dicatat untuk ananda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <Card key={ses.id} className="p-5 space-y-3" hoverEffect>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slateNavy-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="font-bold text-sm text-slateNavy-900">
                        {new Date(ses.session_date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-slateNavy-400">({ses.duration_minutes} Menit)</span>
                    </div>

                    <Badge variant={ses.status === 'finalized' ? 'green' : 'amber'} size="sm">
                      {ses.status === 'finalized' ? 'Difinalisasi' : 'Draft'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-slateNavy-700">
                    <div>
                      <span className="font-bold text-slateNavy-900 block text-[11px] uppercase">Materi Pembelajaran:</span>
                      <p className="mt-0.5">{ses.material}</p>
                    </div>

                    {ses.achievements && (
                      <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900">
                        <span className="font-bold block text-[10px] uppercase">Pencapaian Belajar:</span>
                        <p className="mt-0.5">{ses.achievements}</p>
                      </div>
                    )}

                    {ses.difficulties && (
                      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-amber-900">
                        <span className="font-bold block text-[10px] uppercase">Kesulitan / Butuh Latihan:</span>
                        <p className="mt-0.5">{ses.difficulties}</p>
                      </div>
                    )}

                    {ses.home_recommendations && (
                      <div className="p-2.5 bg-brand-50/60 rounded-xl border border-brand-100 text-brand-900">
                        <span className="font-bold block text-[10px] uppercase">Rekomendasi Latihan di Rumah:</span>
                        <p className="mt-0.5">{ses.home_recommendations}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3, 4, 5: Calistung Evaluasi Matrix */}
      {(activeTab === 'membaca' || activeTab === 'menulis' || activeTab === 'berhitung') && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slateNavy-900 capitalize">
                Evaluasi Aspek {activeTab}
              </h3>
              <p className="text-xs text-slateNavy-500">
                Pencapaian berdasarkan evaluasi sesi belajar tutor yang telah difinalisasi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-slateNavy-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Indikator Kompetensi</th>
                  <th className="p-3">Status Terakhir</th>
                  <th className="p-3 rounded-r-xl">Catatan Observasi Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateNavy-100">
                {(activeTab === 'membaca' ? readIndicators : activeTab === 'menulis' ? writeIndicators : mathIndicators).map((ind) => {
                  // Find latest assessment for this indicator
                  let latestAssessment = null;
                  for (const ses of sessions) {
                    const match = ses.assessments?.find((a) => a.indicator_id === ind.id);
                    if (match && match.assessment_level !== 'UNASSESSED') {
                      latestAssessment = match;
                      break;
                    }
                  }

                  const level: AssessmentLevel = latestAssessment?.assessment_level || 'UNASSESSED';
                  const conf = ASSESSMENT_CONFIG[level];

                  return (
                    <tr key={ind.id} className="hover:bg-cream-50/50">
                      <td className="p-3 font-semibold text-slateNavy-900">
                        {ind.indicator_name}
                        {ind.description && (
                          <span className="block text-[11px] text-slateNavy-400 font-normal">{ind.description}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center font-bold px-2.5 py-1 rounded-full text-xs border ${conf.bg} ${conf.color} ${conf.border}`}
                        >
                          {conf.label} ({conf.short})
                        </span>
                      </td>
                      <td className="p-3 text-slateNavy-600 italic">
                        {latestAssessment?.evidence_notes || 'Belum diamati dalam sesi'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 6: Kehadiran */}
      {activeTab === 'kehadiran' && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-base text-slateNavy-900">Rekapitulasi Kehadiran Siswa</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-700 font-semibold block">Hadir</span>
              <span className="text-2xl font-extrabold text-emerald-800">{presentCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xs text-blue-700 font-semibold block">Izin</span>
              <span className="text-2xl font-extrabold text-blue-800">{permissionCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-700 font-semibold block">Sakit</span>
              <span className="text-2xl font-extrabold text-amber-800">{sickCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-700 font-semibold block">Alpa</span>
              <span className="text-2xl font-extrabold text-rose-800">{absentCount}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slateNavy-600">Catatan Tanggal Kehadiran:</h4>
            {attendances.map((att) => (
              <div key={att.id} className="p-3 rounded-xl bg-slateNavy-50 border border-slateNavy-100 flex items-center justify-between text-xs">
                <span>{new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <Badge variant={att.status === 'present' ? 'green' : att.status === 'permission' ? 'blue' : 'rose'} size="sm">
                  {att.status === 'present' ? 'Hadir' : att.status === 'permission' ? 'Izin' : att.status === 'sick' ? 'Sakit' : 'Alpa'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 7: Catatan Tutor */}
      {activeTab === 'catatan' && (
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-base text-slateNavy-900">Kumpulan Catatan Tutor & Rekomendasi</h3>
          {sessions.length === 0 ? (
            <p className="text-xs text-slateNavy-500">Belum ada catatan.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((ses) => (
                <div key={ses.id} className="p-4 rounded-2xl bg-cream-50/80 border border-slateNavy-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slateNavy-500 text-[11px]">
                    <span className="font-bold text-slateNavy-800">
                      Sesi: {new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span>{ses.duration_minutes} Menit</span>
                  </div>
                  {ses.teacher_notes && (
                    <p className="text-slateNavy-800">
                      <strong className="text-slateNavy-900">Observasi:</strong> {ses.teacher_notes}
                    </p>
                  )}
                  {ses.home_recommendations && (
                    <p className="text-brand-900 bg-brand-50/70 p-2 rounded-xl">
                      <strong>Rekomendasi di Rumah:</strong> {ses.home_recommendations}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 8: Laporan PDF */}
      {activeTab === 'laporan' && (
        <Card className="p-6 text-center space-y-4">
          <FileText className="w-12 h-12 text-brand-500 mx-auto" />
          <h3 className="font-bold text-lg text-slateNavy-900">Laporan Perkembangan Belajar Anak</h3>
          <p className="text-xs text-slateNavy-500 max-w-md mx-auto">
            Hasilkan laporan PDF 3 halaman resmi siap kirim ke orang tua melalui WhatsApp atau unduh file.
          </p>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('/tutor/reports')}
          >
            Buka Pembuat Laporan PDF
          </Button>
        </Card>
      )}
    </div>
  );
};
