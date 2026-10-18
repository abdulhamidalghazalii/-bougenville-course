import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useNavigate } from 'react-router-dom';

export const StudentProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAppStore();
  const myStudents = store.getTutorStudents();
  const sessions = store.getTutorSessions();
  const indicators = store.indicators;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(myStudents[0]?.id || '');
  const selectedStudent = myStudents.find((s) => s.id === selectedStudentId) || myStudents[0];

  const studentSessions = selectedStudent
    ? sessions.filter((s) => s.student_id === selectedStudent.id && s.status === 'finalized').reverse()
    : [];

  // Line Chart: Trend over time for 3 domains
  const trendData = studentSessions.map((ses, idx) => {
    const asm = ses.assessments || [];
    const getAvg = (cat: 'membaca' | 'menulis' | 'berhitung') => {
      const catIndIds = new Set(indicators.filter((i) => i.category === cat).map((i) => i.id));
      const relevant = asm.filter((a) => catIndIds.has(a.indicator_id) && a.assessment_level !== 'UNASSESSED');
      if (relevant.length === 0) return null;
      const scoreSum = relevant.reduce((acc, curr) => {
        const map: Record<string, number> = { BB: 1, MB: 2, BSH: 3, BSB: 4 };
        return acc + (map[curr.assessment_level] || 0);
      }, 0);
      return Number((scoreSum / relevant.length).toFixed(1));
    };

    return {
      sessionName: `Sesi ${idx + 1} (${new Date(ses.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})`,
      Membaca: getAvg('membaca'),
      Menulis: getAvg('menulis'),
      Berhitung: getAvg('berhitung'),
    };
  });

  // Pie Chart: Distribution of all assessed indicators in the latest finalized session
  const latestSession = studentSessions[studentSessions.length - 1];
  const latestAssessments = latestSession?.assessments || [];

  const bsbCount = latestAssessments.filter((a) => a.assessment_level === 'BSB').length;
  const bshCount = latestAssessments.filter((a) => a.assessment_level === 'BSH').length;
  const mbCount = latestAssessments.filter((a) => a.assessment_level === 'MB').length;
  const bbCount = latestAssessments.filter((a) => a.assessment_level === 'BB').length;

  const pieData = [
    { name: 'BSB (Berkembang Sangat Baik)', value: bsbCount, color: '#10B981' },
    { name: 'BSH (Berkembang Sesuai Harapan)', value: bshCount, color: '#38A3F6' },
    { name: 'MB (Mulai Berkembang)', value: mbCount, color: '#F59E0B' },
    { name: 'BB (Belum Berkembang)', value: bbCount, color: '#F43F5E' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">
            Grafik Perkembangan Belajar Siswa
          </h1>
          <p className="text-sm text-slateNavy-500 mt-1">
            Visualisasi objektif capaian calistung berdasarkan catatan evaluasi nyata dari pertemuan ke pertemuan.
          </p>
        </div>

        {/* Student Selector */}
        {myStudents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slateNavy-500">Pilih Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-xl border border-slateNavy-200 bg-white px-3 py-2 text-xs font-bold text-slateNavy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {myStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.education_level})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Transparency Note per Section 11 */}
      <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 text-xs text-brand-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pedoman Visualisasi Skor: </span>
          Skor numerik (1: BB, 2: MB, 3: BSH, 4: BSB) digunakan semata-mata untuk memvisualisasikan tren observasi pembelajaran tutor. Skor ini bukan tolok ukur psikometri ilmiah mutlak atas kecerdasan anak, melainkan panduan perkembangan belajar yang memotivasi.
        </div>
      </div>

      {studentSessions.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Evaluasi"
          description="Siswa ini belum memiliki sesi pembelajaran yang difinalisasi. Grafik akan tampil secara otomatis setelah sesi pertama disimpan dan difinalisasi."
          icon={<TrendingUp className="w-8 h-8" />}
          actionText="Input Hasil Belajar Sekarang"
          onAction={() => navigate('/tutor/sessions')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Line Chart */}
          <Card className="lg:col-span-2 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slateNavy-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  <span>Tren Capaian Tiga Aspek Calistung</span>
                </h3>
                <p className="text-xs text-slateNavy-500">Perkembangan nilai rata-rata dari setiap sesi bimbingan</p>
              </div>
              <Badge variant="blue" size="sm">
                {studentSessions.length} Sesi Terfinalisasi
              </Badge>
            </div>

            <div className="h-72 w-full pt-4">
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
                  <Line type="monotone" dataKey="Membaca" stroke="#38A3F6" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Menulis" stroke="#EC4899" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Berhitung" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pie Chart: Latest Distribution */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slateNavy-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-pastelPink-500" />
                <span>Distribusi Capaian Terakhir</span>
              </h3>
              <p className="text-xs text-slateNavy-500">
                Sesi: {latestSession?.session_date ? new Date(latestSession.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </p>
            </div>

            {pieData.length === 0 ? (
              <p className="text-xs text-slateNavy-400 py-10 text-center">Belum ada indikator dinilai.</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-slateNavy-100 text-xs">
              <div className="flex justify-between items-center text-emerald-700">
                <span>Berkembang Sangat Baik (BSB):</span>
                <span className="font-bold">{bsbCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-blue-700">
                <span>Berkembang Sesuai Harapan (BSH):</span>
                <span className="font-bold">{bshCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-amber-700">
                <span>Mulai Berkembang (MB):</span>
                <span className="font-bold">{mbCount} Indikator</span>
              </div>
              <div className="flex justify-between items-center text-rose-700">
                <span>Belum Berkembang (BB):</span>
                <span className="font-bold">{bbCount} Indikator</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
